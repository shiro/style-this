import { describe, test } from "vitest";
import { DefaultImport } from "../src/index";
import { evaluateProgramBothModes, getResolver } from "./util/testUtil";

describe("ignored-imports", () => {
  // ignored values throw when they're evaluated, aliased, default and mixed with a non-ignored import
  test("ignored-imports-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await evaluateProgramBothModes(testDir, "entry.tsx", resolver, {
      ignoredImports: { "./lib": ["track", DefaultImport], "./browser": true },
    });
  });
});
