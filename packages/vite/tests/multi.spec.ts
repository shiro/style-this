import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { evaluateProgramBothModesMultiFile, getResolver, setupPlugin } from "./util/testUtil";

describe("multi", () => {
  test("multi-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx"], resolver);
  });

  test("multi-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx", "c.tsx"], resolver);
  });

  test("multi-contextual-overrides", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx"], resolver);
  });

  test("exported-declarations-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx"], resolver);
  });

  // the importer evaluates more of `b.tsx` than its own transform does
  test("importers select the class names of anonymous templates", async () => {
    const testDir = `${__dirname}/exported-declarations-1`;
    const plugin = await setupPlugin(await getResolver());
    const transform = async (file: string) => {
      const filepath = `${testDir}/${file}`;
      await plugin.transform(await readFile(filepath, "utf-8"), filepath);
      const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!);
      return typeof css === "string" ? css : css?.code;
    };

    const css = await transform("b.tsx");
    // `.${getLink()}, .${Theme.accent} {`
    const [, link, accent] = (await transform("entry.tsx"))!.match(/\.(\S+), \.(\S+) \{/)!;
    expect(css).toContain(`.${link} {`);
    expect(css).toContain(`.${accent} {`);
  });

  test("reexports-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx"], resolver);
  });

  test("reexports-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver();

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx"], resolver);
  });
});
