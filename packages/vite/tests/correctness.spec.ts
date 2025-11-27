import { describe, test } from "vitest";
import { evaluateProgram, getResolver, setupPlugin } from "./util/testUtil";

describe("correctness", () => {
  test("correctness-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry.tsx", plugin);
  });
});
