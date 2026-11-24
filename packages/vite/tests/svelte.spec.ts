import { describe, expect, test } from "vitest";
import remapping from "@ampproject/remapping";
import { build, type Plugin, type Rollup } from "vite";
import vitePlugin from "../src/index";
import { getResolver, setupPlugin } from "./util/testUtil";

const filepath = `${__dirname}/Card.svelte`;

const transform = async (code: string) => {
  const plugin = await setupPlugin(await getResolver(), { debug: false });
  const result = await plugin.transform(code, filepath);
  const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!);
  return {
    code: result?.code.replaceAll(__dirname, ""),
    map: result?.map,
    css: typeof css === "string" ? css : css?.code,
    cssMap: typeof css === "string" ? undefined : css?.map,
  };
};

describe("Svelte", () => {
  test("instance and module scripts are transformed in place, keeping their attributes", async () => {
    const { code, css } = await transform(`<script lang="ts" generics="T extends Record<string, unknown>">
  let { item }: Record<"item", T> = $props();
  const local: string = css\`color: \${color};\`;
</script>

<script module lang="ts">
  import { css } from "@style-this/core";
  const color: string = "red";
  export const shared: string = css\`margin: 1px;\`;
</script>

<div class={shared + local}>{item}</div>
`);

    expect(code).toMatchInlineSnapshot(`
      "<script lang="ts" generics="T extends Record<string, unknown>">
      let { item }: Record<"item", T> = $props();
      const local: string = "local-m30di3";
      </script>

      <script module lang="ts">// @ts-nocheck
      import { css } from "@style-this/core";
      import "virtual:style-this:/Card.svelte.css";
      const color: string = "red";
      export const shared: string = "shared-bod2fs";
      </script>

      <div class={shared + local}>{item}</div>
      "
    `);
    expect(css).toContain("color: red");
  });

  test("legacy module scripts, skipping scripts that aren't the component's", async () => {
    const { code } = await transform(`<!-- <script>const old = 1;</script> -->
<script context="module">
  import { css } from "@style-this/core";
  export const shared = css\`margin: 1px;\`;
</script>

<svelte:head>
  <script type="application/ld+json">{ "@context": "https://schema.org" }</script>
</svelte:head>

<script>
  const local = css\`color: red;\`;
</script>
`);

    expect(code).toMatch(/<script context="module">\/\/ @ts-nocheck\n[\s\S]*"shared-\w+";\n<\/script>/);
    expect(code).toContain(`<script type="application/ld+json">{ "@context": "https://schema.org" }</script>`);
    expect(code).toMatch(/<script>\nconst local = "local-\w+";\n<\/script>/);
  });

  test("JS and CSS sourcemaps point to the Svelte file", async () => {
    // the scripts start mid-line after non-ASCII text, the module script after the instance script
    const source = `<!-- 色 --><h1>title</h1><script>const local = css\`color: red;\`;</script>
<span class={local + shared}>色</span> <script module>import { css } from "@style-this/core";
const shared = css\`margin: 1px;\`;</script>
`;
    const { code, map, cssMap } = await transform(source);

    const positionOf = (code: string, text: string) => {
      const lines = code.slice(0, code.indexOf(text)).split("\n");
      return [lines.length - 1, lines.at(-1)!.length];
    };
    const { mappings } = remapping(map, () => null, { decodedMappings: true });
    for (const name of ["local =", "shared ="]) {
      const [line, column] = positionOf(code!, name);
      const segment = mappings[line]?.find((segment) => segment[0] === column);
      expect(segment?.slice(2, 4), name).toEqual(positionOf(source, name));
    }

    expect(cssMap.sourcesContent).toEqual([source]);
    const cssMappings = remapping(cssMap, () => null, { decodedMappings: true }).mappings.flat();
    expect(cssMappings.map((segment) => segment.slice(2, 4))).toEqual(
      expect.arrayContaining([positionOf(source, "css`color"), positionOf(source, "css`margin")]),
    );
  });

  test("components are transformed before an `enforce: \"pre\"` compiler listed first", async () => {
    // like vite-plugin-svelte 5, compiles in a plain transform of an `enforce: "pre"` plugin
    const svelteCompiler: Plugin = {
      name: "svelte-compiler",
      enforce: "pre",
      transform(code, id) {
        if (id.endsWith(".svelte")) return code.match(/<script>([\s\S]*?)<\/script>/)![1];
      },
    };
    const output = (await build({
      root: `${__dirname}/svelte-plugin-order`,
      configFile: false,
      logLevel: "silent",
      plugins: [svelteCompiler, vitePlugin({ useRequire: true })],
      build: { write: false, minify: false, cssMinify: false, lib: { entry: "main.js", formats: ["es"] } },
    })) as Rollup.RollupOutput[];

    const css = output[0].output.find((file) => file.fileName.endsWith(".css"));
    expect(css?.type === "asset" && css.source).toContain("color: rebeccapurple");
  });

  test("error locations and code frames are of the Svelte file", async () => {
    const plugin = await setupPlugin(await getResolver(), { debug: false });
    const code = `<h1>title</h1>
<script>
  import { css } from "@style-this/core";
  const color = () => { throw new Error("no color"); };
  const local = css\`color: \${color()};\`;
</script>
`;
    await plugin.transform(code, filepath);

    await expect(plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!)).rejects.toMatchObject({
      loc: { file: filepath, line: 4, column: 31 },
      frame: expect.stringContaining(`> 4 |   const color = () => { throw new Error("no color"); };\n${" ".repeat(36)}^ no color`),
    });
  });
});
