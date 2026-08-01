import { describe, expect, test } from "vitest";
import { evaluateProgram, getResolver } from "./util/testUtil";
import { setupPlugin } from "./util/testUtil";

describe("extra-class", () => {
  test("extra-class-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);
    await evaluateProgram(testDir, "entry.tsx", plugin);
  });
});
