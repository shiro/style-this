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
    test(`imported module throwing is reported (${atomic ? "atomic" : "default"})`, async () => {
      const testDir = `${__dirname}/evaluation-error-in-import`;
      const resolver = await getResolver(testDir);
      const plugin = await setupPlugin(resolver, { atomic, debug: false });

      await expect(loadCss(plugin, `${testDir}/entry.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
      });

      // other importers of the failing module get the error too
      await expect(loadCss(plugin, `${testDir}/entry-2.tsx`)).rejects.toMatchObject({
        message: "failed to compute color",
      });

      // the compiler keeps working after the failure
      const css = await loadCss(plugin, `${testDir}/working.tsx`);
      expect(typeof css === "object" && css?.code).toContain(".button-");
    });
  }
});
