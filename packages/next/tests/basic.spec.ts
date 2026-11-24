import { mkdirSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, it, expect, vi } from "vitest";
import webpack, { type Configuration } from "webpack";
import { withStyleThis } from "../src/index";
import { loaderConfig } from "../src/loaders/consts";

const transformGlob = "*.{tsx,ts,jsx,js,mjs,cjs,mts,cts}";
const pageExtensions = ["tsx", "ts", "jsx", "js"];

describe("withStyleThis", () => {
  it("adds its config to the user's config without mutating it", () => {
    const turbopack = { resolveAlias: { foo: "./foo" }, rules: { "*.svg": { loaders: ["svg-loader"] } } };
    const userWebpack = vi.fn((config: Configuration) => config);
    const config = withStyleThis({ reactStrictMode: true, turbopack, webpack: userWebpack });

    expect(turbopack).toEqual({ resolveAlias: { foo: "./foo" }, rules: { "*.svg": { loaders: ["svg-loader"] } } });
    expect(config.reactStrictMode).toBe(true);
    expect(config.turbopack?.resolveAlias).toMatchObject({
      foo: "./foo",
      "@style-this/core/atomic": "@style-this/next/style-this.atomic.css",
    });
    expect(Object.keys(config.turbopack?.rules ?? {})).toEqual([
      "*.svg",
      transformGlob,
      "style-this.module.css",
      "style-this.global.css",
      "style-this.atomic-program.js",
    ]);

    // the user's webpack config runs after ours
    const webpackConfig = { module: { rules: [] }, plugins: [] };
    config.webpack!(webpackConfig, {} as any);
    expect(userWebpack).toHaveBeenCalledWith(webpackConfig, {});
    expect(webpackConfig.module.rules).toHaveLength(3);
    // drops the cache of removed files
    expect(webpackConfig.plugins).toHaveLength(1);
  });

  it.each([
    ["rule", { loaders: ["a"] }, [{ loaders: ["a"] }]],
    ["rules and loaders", ["a", { loaders: ["b"] }], ["a", { loaders: ["b"] }]],
  ])("runs the transform after the user's %s of the same glob", (_, userRule, expected) => {
    const rules = withStyleThis({ turbopack: { rules: { [transformGlob]: userRule as any } } }).turbopack?.rules;
    const transformRule = withStyleThis({}).turbopack?.rules?.[transformGlob];

    expect(rules?.[transformGlob]).toEqual([...expected, transformRule]);
  });

  it.each([false, true])("passes `atomic: %s` to every loader", (atomic) => {
    const config = withStyleThis({}, { atomic });
    const aliasFile = atomic ? "style-this.atomic-layers.css" : "style-this.atomic.css";

    const turbopackRules = Object.values(config.turbopack?.rules ?? {}) as { loaders: { options: object }[] }[];
    expect(turbopackRules.flatMap((rule) => rule.loaders.map((loader) => loader.options))).toEqual(
      Array(4).fill({ bundler: "turbopack", atomic, pageExtensions }),
    );
    expect(config.turbopack?.resolveAlias?.["@style-this/core/atomic"]).toBe(`@style-this/next/${aliasFile}`);

    const webpackConfig: Configuration = { module: { rules: [] }, plugins: [] };
    config.webpack!(webpackConfig, {} as any);
    expect(webpackConfig.module!.rules!.map((rule: any) => rule.options)).toEqual(
      Array(3).fill({ bundler: "webpack", atomic, pageExtensions }),
    );
    expect(path.basename((webpackConfig.resolve!.alias as Record<string, string>)["@style-this/core/atomic$"])).toBe(
      aliasFile,
    );
  });

  it.each([
    ["/app/page.tsx?__next_edge_ssr_entry__", ["transformLoader.mjs"]],
    ["/app/page.tsx?raw", []],
    ["/app/icon.tsx?__next_metadata_image_meta__", ["transformLoader.mjs"]],
    // `next-metadata-image-loader` discards the source
    ["/app/icon.tsx?__next_metadata__", []],
  ])("applies the webpack loaders of %s", (request, expected) => {
    const webpackConfig: Configuration = { module: { rules: [] }, plugins: [] };
    withStyleThis({}).webpack!(webpackConfig, {} as any);
    const { ruleSet } = webpack(webpackConfig).newCompilationParams().normalModuleFactory;
    const [resource, resourceQuery] = request.split(/(?=\?)/);

    const effects = ruleSet.exec({ resource, resourceQuery, dependency: "esm", issuer: "", issuerLayer: "" });
    expect(effects.flatMap((effect) => (effect.type === "use" ? [path.basename(effect.value.loader)] : []))).toEqual(
      expected,
    );
  });
});

describe("loaderConfig", () => {
  it.each([
    // `pages` takes precedence over `src/pages`
    [["pages", "src/pages"], pageExtensions, ["pages/_app.tsx", "pages/_app/index.js"]],
    [["src/pages"], pageExtensions, ["src/pages/_app.tsx", "src/pages/_app/index.js"]],
    [["src/pages"], ["page.tsx"], ["src/pages/_app.page.tsx"]],
  ])("imports the CSS of the custom App in %j with %j as global CSS", (pagesDirs, pageExtensions, appFiles) => {
    const dir = mkdtempSync(path.join(tmpdir(), "style-this-next-"));
    for (const pagesDir of pagesDirs) mkdirSync(path.join(dir, pagesDir), { recursive: true });
    const { resolveVirtualImport } = loaderConfig({ bundler: "turbopack", atomic: false, pageExtensions }, dir);
    const files = ["_app.tsx", "_app/index.js", "_app.page.tsx", "_app.mjs", "index.tsx"].flatMap((file) =>
      ["pages", "src/pages", "src/components/pages"].map((pagesDir) => `${pagesDir}/${file}`),
    );

    const globalFiles = files.filter((file) =>
      /style-this\.global\.css/.test(resolveVirtualImport("css", path.join(dir, file))),
    );
    expect(globalFiles).toEqual(appFiles);
  });

  it("creates a transformer per bundler and mode", () => {
    const config = (bundler: "webpack" | "turbopack", atomic: boolean) =>
      loaderConfig({ bundler, atomic, pageExtensions }, "/app");
    expect(config("turbopack", true)).toMatchObject({ atomic: true, useRequire: true });
    expect(config("webpack", false)).toMatchObject({ atomic: false, useRequire: false });
    const keys = (["webpack", "turbopack"] as const).flatMap((bundler) =>
      [false, true].map((atomic) => config(bundler, atomic).key),
    );
    expect(new Set(keys).size).toBe(4);
  });
});
