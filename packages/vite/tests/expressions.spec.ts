import { describe, test } from "vitest";
import { evaluateProgramBothModes, getResolver } from "./util/testUtil";

describe("expressions", () => {
  test("expressions-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });

  test("expressions-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
});
