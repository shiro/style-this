import { describe, test } from "vitest";
import { evaluateProgramBothModesMultiFile, getResolver } from "./util/testUtil";
import { join } from "path";

describe("edge-cases", () => {
  test("edge-cases-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModesMultiFile(testDir, ["entry-1.tsx", "shared.tsx", "entry-2.tsx"], resolver);
  });

  test("edge-cases-library-imports", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    resolver["some_lib"] = join(testDir, "node_modules/some_lib/index.js");

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx"], resolver);
  });
});
