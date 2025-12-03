import { describe, test } from "vitest";
import { evaluateProgram, getResolver, setupPlugin } from "./util/testUtil";
import { join } from "path";

describe("edge-cases", () => {
  test("edge-cases-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry-1.tsx", plugin);
    await evaluateProgram(testDir, "shared.tsx", plugin);
    await evaluateProgram(testDir, "entry-2.tsx", plugin);
  });

  test("edge-cases-library-imports", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    resolver["some_lib"] = join(testDir, "node_modules/some_lib/index.js");
    const plugin = await setupPlugin(resolver);

    await evaluateProgram(testDir, "entry.tsx", plugin);
  });
});
