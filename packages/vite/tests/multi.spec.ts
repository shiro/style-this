import { describe, test } from "vitest";
import { evaluateProgramBothModesMultiFile, getResolver } from "./util/testUtil";

describe("multi", () => {
  test("multi-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx"], resolver);
  });

  test("multi-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx", "c.tsx"], resolver);
  });

  test("multi-contextual-overrides", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModesMultiFile(testDir, ["entry.tsx", "b.tsx"], resolver);
  });
});
