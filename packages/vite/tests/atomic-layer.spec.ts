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

const entryChunk = (cssFileName: string) => ({
  type: "chunk",
  isEntry: true,
  moduleIds: [ATOMIC_ENTRYPOINT_ID],
  modules: {},
  viteMetadata: { importedCss: new Set([cssFileName]) },
});

describe("atomic CSS layer", () => {
  test("dev: entrypoint declares the layer order and wraps atomic CSS in the utilities layer", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      (plugin.configureServer as Function)({ environments: {} });

      const code = await loadCode(plugin, ATOMIC_ENTRYPOINT_ID);
      expect(code.startsWith(LAYER_ORDER)).toBe(true);
      expect(code).toMatch(/@layer utilities \{\n[^}]*color: red[^}]*\}\n\}$/);
    });
  });

  test("build: entrypoint only declares the layer order, atomic CSS is appended in the utilities layer", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      expect(await loadCode(plugin, ATOMIC_ENTRYPOINT_ID)).toBe(LAYER_ORDER);

      const componentCss = `${LAYER_ORDER}\n.component { color: blue }`;
      const bundle: Record<string, any> = {
        "app.js": entryChunk("assets/app.css"),
        "assets/app.css": { type: "asset", source: componentCss },
      };
      await plugin.generateBundle({}, bundle);

      const css: string = bundle["assets/app.css"].source;
      expect(css.startsWith(componentCss)).toBe(true);
      const appended = css.slice(componentCss.length);
      expect(appended.startsWith(`\n${LAYER_ORDER}\n@layer utilities {\n`)).toBe(true);
      expect(appended).toContain("color: red");
      expect(appended.endsWith("\n}")).toBe(true);
      expect(bundle["assets/atomic.css"]).toBeUndefined();
    });
  });

  test("build: emitted standalone atomic stylesheet is layered", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      const bundle: Record<string, any> = {};
      await plugin.generateBundle({}, bundle);

      const css: string = bundle["assets/atomic.css"].source;
      expect(css.startsWith(`${LAYER_ORDER}\n@layer utilities {\n`)).toBe(true);
      expect(css).toContain("color: red");
    });
  });

  test("build: a plugin configured again (reused for another build) keeps the atomic CSS", async () => {
    await withStyledFile({ atomic: true }, async (plugin) => {
      await plugin.config({});
      const bundle: Record<string, any> = {};
      await plugin.generateBundle({}, bundle);

      expect(bundle["assets/atomic.css"].source).toContain("color: red");
    });
  });

  test("non-atomic mode: no layers", async () => {
    await withStyledFile({ atomic: false }, async (plugin, file) => {
      expect(await loadCode(plugin, ATOMIC_ENTRYPOINT_ID)).not.toContain("@layer");

      const componentCss = await loadCode(plugin, `${VIRTUAL_PREFIX}${file}.css`);
      expect(componentCss).toContain("color: red");
      expect(componentCss).not.toContain("@layer");

      const bundle: Record<string, any> = {
        "app.js": entryChunk("assets/app.css"),
        "assets/app.css": { type: "asset", source: ".component { color: blue }" },
      };
      await plugin.generateBundle({}, bundle);
      expect(bundle["assets/app.css"].source).toBe(".component { color: blue }");
      expect(bundle["assets/atomic.css"]).toBeUndefined();
    });
  });

  describe("vite build", () => {
    const root = `${__dirname}/atomic-build`;
    const buildCss = async (plugin: ReturnType<typeof vitePlugin>, config: InlineConfig["build"]) => {
      const result = (await build({
        root,
        configFile: false,
        logLevel: "silent",
        plugins: [plugin],
        build: { write: false, minify: false, cssMinify: false, ...config },
      })) as Rollup.RollupOutput | Rollup.RollupOutput[];
      const [{ output }] = [result].flat();
      return output.filter((file) => file.type === "asset" && file.fileName.endsWith(".css")) as Rollup.OutputAsset[];
    };

    test("library mode: atomic CSS is appended to the library stylesheet", async () => {
      const css = await buildCss(vitePlugin({ useRequire: true, atomic: true }), {
        lib: { entry: "main.ts", formats: ["es"], cssFileName: "lib" },
      });

      expect(css.map((file) => file.fileName)).toEqual(["lib.css"]);
      expect(css[0].source).toContain("color: red");
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
