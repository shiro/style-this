import { describe, expect, test } from "vitest";
import { readFile } from "fs/promises";
import { getResolver, setupPlugin } from "./util/testUtil";

const testDir = `${__dirname}/value-cache`;

const setup = async () => {
  const plugin = await setupPlugin(await getResolver());
  const loadCss = async (name: string) => {
    const filepath = `${testDir}/${name}`;
    await plugin.transform(await readFile(filepath, "utf-8"), filepath);
    const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!);
    return typeof css === "string" ? css : css?.code;
  };
  // the evaluated program of `name` for `importer`
  const evaluation = (name: string, importer: string) =>
    Object.entries(plugin.__getDebugVirtualModules()).find(([key]) =>
      key.startsWith(`${testDir}/${name} (${testDir}/${importer}): `),
    );
  return { loadCss, evaluation };
};

describe("value cache", () => {
  test("cached exports are read by their exported name", async () => {
    const { loadCss, evaluation } = await setup();

    expect(await loadCss("entry-a.tsx")).toContain("color: blue");
    // the local `a` used to be read from the cached export `a`
    expect(await loadCss("entry-b.tsx")).toContain("color: red");

    // both locals are read from the cache, under the other's name
    expect(await loadCss("entry-pair.tsx")).toContain("border-color: red blue");
    const [, program] = evaluation("swapped.ts", "entry-pair.tsx")!;
    expect(program).not.toMatch(/"red"|"blue"/);
  });

  test("namespaces are cached", async () => {
    const { loadCss, evaluation } = await setup();

    expect(await loadCss("entry-namespace-1.tsx")).toContain("color: green");
    expect(await loadCss("entry-namespace-2.tsx")).toContain("color: green");
    // the second importer evaluates nothing
    expect(evaluation("theme.ts", "entry-namespace-2.tsx")?.[0]).toMatch(/: \{\}$/);
  });
});
