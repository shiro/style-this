import { beforeAll, describe, expect, test } from "vitest";
import { Transformer, initializeStyleThis } from "@style-this/core/compiler";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const code = `import { css } from "@style-this/core";\nimport { color } from "./dep";\n\nexport const style = css\`\n  color: \${color};\n\`;\n`;

const loadFile = async (id: string) =>
  id === "./dep" ? ["/app/dep.ts", `export const color = "red";`] : [require.resolve(id), ""];

type Options = ConstructorParameters<typeof Transformer>[0];

/** Function giving the CSS a transformer's evaluation of the entry resolves its virtual module with. */
const setup = (opts: Partial<Options> = {}) => {
  const cssStore = new Map<string, { resolve: (css: unknown) => void }>();
  const transformer = new Transformer({
    cwd: "/app",
    ignoredImports: {},
    loadFile: async () => { throw new Error("unused"); },
    cacheRegistry: { initializeRefs: (cssRef) => { (globalThis as any)[cssRef] = cssStore; } },
    cssExtension: "css",
    useRequire: true,
    createRequire: require as never,
    ...opts,
  });

  const evaluate = async (loadFile: unknown) => {
    const css = new Promise((resolve) => cssStore.set("/app/entry.tsx.css", { resolve }));
    await transformer.transform(code, "/app/entry.tsx", false, loadFile as never);
    return css;
  };
  return evaluate;
};

describe("host input errors", () => {
  beforeAll(initializeStyleThis);

  // used to panic, which hung the evaluation
  test.each([
    ["throwing synchronously", () => { throw new Error("sync"); }],
    ["resolving to a non-array", async () => undefined],
    ["resolving to a short array", async (id: string) => [id]],
    ["resolving to non-strings", async (id: string) => [id, 1]],
  ])("loadFile %s is reported", async (_, badLoadFile) => {
    const evaluate = setup();

    expect(await evaluate(badLoadFile)).toMatchObject({ message: "failed to read file '@style-this/core'" });

    // the transformer keeps working
    expect(await evaluate(loadFile)).toContain("color: red");
  });

  // used to panic, which hung the evaluation
  test("a throwing onDebugVirtualModule is ignored", async () => {
    let calls = 0;
    const evaluate = setup({
      debug: true,
      onDebugVirtualModule: () => {
        calls++;
        throw new Error("debug");
      },
    });

    expect(await evaluate(loadFile)).toContain("color: red");
    expect(calls).toBeGreaterThan(0);
  });

  // used to panic, which aborted wasm
  test.each([
    ["cwd", { cwd: undefined }, "a string"],
    ["loadFile", { loadFile: "loadFile" }, "a function"],
    ["cssExtension", { cssExtension: 1 }, "a string"],
  ])("an invalid %s option throws", (option, opts, expected) => {
    expect(() => setup(opts as never)).toThrow(`invalid option '${option}', expected ${expected}`);
  });

  test("missing options throw", () => {
    expect(() => new Transformer(undefined as never)).toThrow("invalid option 'cwd', expected a string");
  });
});
