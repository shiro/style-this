import { describe, expect, test } from "vitest";
import { evaluateProgramBothModes, getResolver, setupPlugin } from "./util/testUtil";

describe("correctness", () => {
  test("correctness-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });

  // they used to be undeclared in the evaluated program
  test.each([
    ["for-of", "for (const x of [1]) css`margin: ${x}px;`;"],
    ["for", "for (let x = 0; x < 1; x++) css`margin: ${x}px;`;"],
    ["var loop", "function f() { for (var x of [1]); return css`margin: ${x}px;`; }"],
    ["catch", "try {} catch (x) { css`margin: ${x}px;`; }"],
  ])("%s bindings are dynamic", async (_, code) => {
    const plugin = await setupPlugin(await getResolver());
    await expect(
      plugin.transform(`import { css } from "@style-this/core";\n${code}`, `${__dirname}/bindings.tsx`),
    ).rejects.toMatchObject({ message: expect.stringContaining("tried to access dynamic variable 'x'") });
  });

  // declarations used to be walked twice, doubling the time with each nesting level
  test("deeply nested function and class declarations", async () => {
    let body = "return css`color: red;`;";
    // both in every level, so walking either twice still doubles the time per level
    for (let i = 0; i < 22; i++) {
      body = `function f${i}() { class C${i} { static f() { ${body} } }\nreturn C${i}.f(); }\nreturn f${i}();`;
    }
    const code = `import { css } from "@style-this/core";\nfunction f() { ${body} }\nexport const nested = css\`\${f().css}\`;`;
    const filepath = `${__dirname}/nested.tsx`;
    const plugin = await setupPlugin(await getResolver());

    const start = performance.now();
    await plugin.transform(code, filepath);
    expect(performance.now() - start).toBeLessThan(1000);

    const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!);
    expect(typeof css === "string" ? css : css?.code).toMatch(/\.nested-\w+ \{\s*color: red;\s*\}/);
  });
});
