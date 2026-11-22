import { readFile } from "fs/promises";
import { join } from "path";
import { expect, test } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";

test("relative imports resolve against the importing file", async () => {
  const testDir = join(__dirname, "relative-imports");
  const plugin = await setupPlugin(await getResolver(), { atomic: false });

  const cssOf = async (name: string) => {
    const filepath = join(testDir, name);
    await plugin.transform(await readFile(filepath, "utf-8"), filepath);
    const css = await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath));
    return typeof css === "string" ? css : css?.code;
  };

  // `./theme` is a different file from `entry.tsx` and `nested/button.tsx`
  const entryCss = await cssOf("entry.tsx");
  expect(entryCss).toContain("color: red;");
  expect(entryCss).toContain("border-color: blue;");

  const buttonCss = await cssOf("nested/button.tsx");
  expect(buttonCss).toContain("color: blue;");
  expect(buttonCss).toContain("background: red;");
});
