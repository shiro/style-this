import { describe, expect, test } from "vitest";
import { readFile } from "fs/promises";
import { getResolver, setupPlugin } from "./util/testUtil";

const loadCss = async (plugin: Awaited<ReturnType<typeof setupPlugin>>, filepath: string) => {
  await plugin.transform(await readFile(filepath, "utf-8"), filepath);
  const id = plugin.resolveId(`virtual:style-this:${filepath}.${plugin.cssExtension}`, filepath);
  return plugin.load(id);
};

describe("evaluation errors", () => {
  for (const atomic of [false, true]) {
    test(`module throwing is reported (${atomic ? "atomic" : "default"})`, async () => {
      const testDir = `${__dirname}/evaluation-error-in-import`;
      const resolver = await getResolver();
      const plugin = await setupPlugin(resolver, { atomic, debug: false });

      // the location of the evaluated code is mapped to the source
      await expect(loadCss(plugin, `${testDir}/dep.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
        loc: { file: `${testDir}/dep.tsx`, line: 4, column: 9 },
      });

      // importers evaluate the failing module again instead of reading its missing exports, the code
      // frame is of the failing module
      await expect(loadCss(plugin, `${testDir}/entry.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
        loc: { file: `${testDir}/dep.tsx`, line: 4 },
        frame: expect.stringContaining('> 4 |   throw new Error("failed to compute color");'),
      });

      // other importers of the failing module get the error too
      await expect(loadCss(plugin, `${testDir}/entry-2.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
      });

      // the compiler keeps working after the failure
      const css = await loadCss(plugin, `${testDir}/working.tsx`);
      expect(typeof css === "object" && css?.code).toContain(".button-");
    });

    test(`error in a template is located in the source (${atomic ? "atomic" : "default"})`, async () => {
      const testDir = `${__dirname}/evaluation-error-in-import`;
      const resolver = await getResolver();
      const plugin = await setupPlugin(resolver, { atomic, debug: false });

      // the column is in UTF-16 code units like JS strings, the emoji before the error is 2
      await expect(loadCss(plugin, `${testDir}/template.tsx`)).rejects.toMatchObject({
        message: "no color",
        loc: { file: `${testDir}/template.tsx`, line: 6, column: 55 },
        stack: expect.stringContaining(`at <anonymous> (${testDir}/template.tsx:6:55)`),
      });
    });

    test(`module dropped by a failing sibling is reported (${atomic ? "atomic" : "default"})`, async () => {
      const testDir = `${__dirname}/evaluation-error-in-import`;
      const resolver = await getResolver();
      const plugin = await setupPlugin(resolver, { atomic, debug: false });

      await expect(loadCss(plugin, `${testDir}/entry-slow.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
      });

      // the dropped evaluation of `slow-dep` didn't cache its exports, so they're evaluated again
      await expect(loadCss(plugin, `${testDir}/entry-slow-2.tsx`)).rejects.toMatchObject({
        message: "failed to compute size",
      });
    });

    test(`invalid default export is reported (${atomic ? "atomic" : "default"})`, async () => {
      const testDir = `${__dirname}/evaluation-error-in-import`;
      const resolver = await getResolver();
      const plugin = await setupPlugin(resolver, { atomic, debug: false });

      // used to panic, which hung the evaluation. Without a location, the evaluated file is reported instead of the
      // virtual id or the importer
      await expect(loadCss(plugin, `${testDir}/entry-default-super.tsx`)).rejects.toMatchObject({
        message: "'super' keyword unexpected here",
        id: `${testDir}/default-super.tsx`,
      });
    });
  }
});
