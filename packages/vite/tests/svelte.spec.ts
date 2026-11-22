import { describe, expect, test } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";

const filepath = `${__dirname}/Card.svelte`;

const transform = async (code: string) => {
  const plugin = await setupPlugin(await getResolver(), { debug: false });
  const result = await plugin.transform(code, filepath);
  const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!);
  return { code: result?.code.replaceAll(__dirname, ""), css: typeof css === "string" ? css : css?.code };
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
});
