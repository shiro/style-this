import { describe, test } from "vitest";
import { evaluateProgram, getResolver } from "./util/testUtil";
import { setupPlugin } from "./util/testUtil";

describe("multi", () => {
  test("multi-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry.tsx", plugin);
    await evaluateProgram(testDir, "b.tsx", plugin);
  });

  test("multi-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry.tsx", plugin);
    await evaluateProgram(testDir, "b.tsx", plugin);
    await evaluateProgram(testDir, "c.tsx", plugin);
  });

  test("multi-contextual-overrides", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry.tsx", plugin);
    await evaluateProgram(testDir, "b.tsx", plugin);
  });
});
