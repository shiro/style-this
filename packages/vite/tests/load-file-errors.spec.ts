import { beforeAll, describe, expect, test } from "vitest";
import { Transformer, initializeStyleThis } from "@style-this/core/compiler";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const code = `import { css } from "@style-this/core";\nimport { color } from "./dep";\n\nexport const style = css\`\n  color: \${color};\n\`;\n`;

describe("loadFile errors", () => {
  beforeAll(initializeStyleThis);

  // used to panic, which hung the evaluation
  test.each([
    ["throwing synchronously", () => { throw new Error("sync"); }],
    ["resolving to a non-array", async () => undefined],
    ["resolving to a short array", async (id: string) => [id]],
    ["resolving to non-strings", async (id: string) => [id, 1]],
  ])("%s is reported", async (_, loadFile) => {
    const cssStore = new Map<string, { resolve: (css: unknown) => void }>();
    const transformer = new Transformer({
      cwd: "/app",
      ignoredImports: {},
      loadFile: async () => { throw new Error("unused"); },
      cacheRegistry: { initializeRefs: (cssRef) => { (globalThis as any)[cssRef] = cssStore; } },
      cssExtension: "css",
      useRequire: true,
      createRequire: require as never,
    });

    /** CSS the evaluation of the entry resolves its virtual module with. */
    const evaluate = async (loadFile: unknown) => {
      const css = new Promise((resolve) => cssStore.set("/app/entry.tsx.css", { resolve }));
      await transformer.transform(code, "/app/entry.tsx", false, loadFile as never);
      return css;
    };

    expect(await evaluate(loadFile)).toMatchObject({ message: "failed to read file '@style-this/core'" });

    // the transformer keeps working
    const css = await evaluate(async (id: string) =>
      id === "./dep" ? ["/app/dep.ts", `export const color = "red";`] : [require.resolve(id), ""],
    );
    expect(css).toContain("color: red");
  });
});
