import { describe, test, expect } from "vitest";
import { build, createServer, type InlineConfig, type Rollup } from "vite";
import vitePlugin from "../src/index";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const ATOMIC_ENTRYPOINT_ID = `${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`;
const LAYER_ORDER = "@layer theme, base, components, utilities;";

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

const loadCode = async (plugin: Plugin, id: string) => {
  const result = await plugin.load(id);
  return typeof result === "string" ? result : (result?.code ?? "");
};

const withStyledFile = async (
  options: { atomic: boolean },
  run: (plugin: Plugin, file: string) => Promise<void>,
) => {
  const dir = await mkdtemp(join(tmpdir(), "style-this-atomic-layer-"));
  try {
    const file = join(dir, "a.tsx");
    await writeFile(
      file,
      `import "@style-this/core/atomic";
import { css } from "@style-this/core";

export const aStyle = css\`
  color: red;
\`;
`,
    );

    const plugin = await setupPlugin({ "@style-this/core": "" }, { debug: false, ...options });
    const { code } = (await plugin.transform(await readFile(file, "utf-8"), file))!;
    // the styled file's entrypoint import must resolve to the module the atomic CSS is served from
    const entrypointImport = code.match(/^import "(.*atomic.*)";$/m)?.[1];
    expect(entrypointImport && plugin.resolveId(entrypointImport, file)).toBe(ATOMIC_ENTRYPOINT_ID);
    if (options.atomic) await loadCode(plugin, `${VIRTUAL_PREFIX}${file}.style-this.js`);
    await run(plugin, file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

describe("atomic CSS layer", () => {
  test("dev: entrypoint declares the layer order and wraps atomic CSS in the utilities layer", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      (plugin.configureServer as Function)({ environments: {} });

      const code = await loadCode(plugin, ATOMIC_ENTRYPOINT_ID);
      expect(code.startsWith(LAYER_ORDER)).toBe(true);
      expect(code).toMatch(/@layer utilities \{\n[^}]*color: red[^}]*\}\n\}$/);
    });
  });

  test("build: a plugin configured again (reused for another build) keeps the atomic CSS", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      await plugin.config({});

      expect(await plugin.renderAtomicCss()).toContain("color: red");
    });
  });

  test("non-atomic mode: no layers", async () => {
    await withStyledFile({ atomic: false }, async (plugin, file) => {
      expect(await loadCode(plugin, ATOMIC_ENTRYPOINT_ID)).not.toContain("@layer");

      const componentCss = await loadCode(plugin, `${VIRTUAL_PREFIX}${file}.css`);
      expect(componentCss).toContain("color: red");
      expect(componentCss).not.toContain("@layer");
    });
  });

  describe("vite build", () => {
    const root = `${__dirname}/atomic-build`;
    const buildCss = async (
      plugin: ReturnType<typeof vitePlugin>,
      config: InlineConfig["build"],
      transformSource: (code: string) => string = (code) => code,
    ) => {
      const result = (await build({
        root,
        configFile: false,
        logLevel: "silent",
        plugins: [
          plugin,
          {
            name: "test:source",
            async load(id) {
              if (id === `${root}/main.ts`) return transformSource(await readFile(id, "utf-8"));
            },
          },
        ],
        build: { write: false, minify: false, cssMinify: false, ...config },
      })) as Rollup.RollupOutput | Rollup.RollupOutput[];
      const [{ output }] = [result].flat();
      return output.filter((file) => file.type === "asset" && file.fileName.endsWith(".css")) as Rollup.OutputAsset[];
    };

    test("atomic CSS is minified and part of the stylesheet's hash", async () => {
      const buildWithColor = (color: string) =>
        buildCss(
          vitePlugin({ useRequire: true, atomic: true }),
          { cssMinify: true, rollupOptions: { input: `${root}/main.ts` } },
          (code) => code.replace("red", color),
        );
      const red = await buildWithColor("red");
      const blue = await buildWithColor("blue");

      expect(red).toHaveLength(1);
      expect(red[0].source).toMatch(/@layer utilities\{\.[\w-]+\{color:red\}\}/);
      expect(blue[0].source).toMatch(/@layer utilities\{\.[\w-]+\{color:#?\w+\}\}/);
      expect(red[0].fileName).not.toBe(blue[0].fileName);
    });

    test("library mode: atomic CSS is part of the library stylesheet", async () => {
      const css = await buildCss(vitePlugin({ useRequire: true, atomic: true }), {
        lib: { entry: "main.ts", formats: ["es"], cssFileName: "lib" },
      });

      expect(css.map((file) => file.fileName)).toEqual(["lib.css"]);
      expect(css[0].source).toContain("color: red");
    });

    test("warns when the atomic entrypoint isn't imported", async () => {
      const warnings: string[] = [];
      const css = await buildCss(
        vitePlugin({ useRequire: true, atomic: true }),
        {
          rollupOptions: { input: `${root}/main.ts`, onwarn: (warning) => void warnings.push(warning.message) },
        },
        (code) => code.replace('import "@style-this/core/atomic";', ""),
      );

      expect(css.map((file) => file.source).join()).not.toContain("color");
      expect(warnings).toEqual([expect.stringContaining("'@style-this/core/atomic' isn't imported")]);
    });

    test("SSR build: no atomic stylesheet is emitted", async () => {
      const css = await buildCss(vitePlugin({ useRequire: true, atomic: true }), { ssr: "main.ts" });

      expect(css).toEqual([]);
    });

    test("build after serving with the same plugin instance takes the build paths", async () => {
      const plugin = vitePlugin({ useRequire: true, atomic: true });
      const server = await createServer({
        root,
        configFile: false,
        logLevel: "silent",
        plugins: [plugin],
        server: { middlewareMode: true, ws: false },
      });
      await server.transformRequest("/main.ts");
      await server.close();

      const css = await buildCss(plugin, { rollupOptions: { input: `${root}/main.ts` } });

      expect(css).toHaveLength(1);
      expect(String(css[0].source).match(/color: red/g)).toHaveLength(1);
    });
  });
});
