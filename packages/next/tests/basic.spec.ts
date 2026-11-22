import { describe, it, expect, vi } from "vitest";
import type { Configuration } from "webpack";
import { withStyleThis } from "../src/index";
import { loaderConfig } from "../src/loaders/consts";

const transformGlob = "*.{tsx,ts,jsx,js,mjs}";

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
  });

  it.each([
    ["rule", { loaders: ["a"] }, [{ loaders: ["a"] }]],
    ["rules and loaders", ["a", { loaders: ["b"] }], ["a", { loaders: ["b"] }]],
  ])("runs the transform after the user's %s of the same glob", (_, userRule, expected) => {
    const rules = withStyleThis({ turbopack: { rules: { [transformGlob]: userRule as any } } }).turbopack?.rules;
    const transformRule = withStyleThis({}).turbopack?.rules?.[transformGlob];

    expect(rules?.[transformGlob]).toEqual([...expected, transformRule]);
  });
});

describe("loaderConfig", () => {
  it("imports the CSS of the pages router's `_app` as global CSS", () => {
    const { resolveVirtualImport } = loaderConfig({ bundler: "turbopack" });

    expect(resolveVirtualImport("css", "/app/src/pages/_app.tsx")).toMatch(/style-this\.global\.css\?filepath=/);
    expect(resolveVirtualImport("css", "/app/src/pages/index.tsx")).toMatch(/style-this\.module\.css\?filepath=/);
  });
});
