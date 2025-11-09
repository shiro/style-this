import { describe, expect, test } from "vitest";
import { evaluateProgram, getResolver } from "./util/testUtil";
import { setupPlugin } from "./util/testUtil";

describe("basic", () => {
  test("basic-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);
    await evaluateProgram(testDir, "entry.tsx", plugin);
  });
  test("basic-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);
    await evaluateProgram(testDir, "entry.tsx", plugin);
  });
  test("basic-invalid-program", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await expect(evaluateProgram(testDir, "entry.tsx", plugin)).rejects.toThrow(
      "failed to parse program",
    );
  });
});
