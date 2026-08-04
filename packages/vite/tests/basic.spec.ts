import { describe, expect, test } from "vitest";
import { evaluateProgramBothModes, getResolver } from "./util/testUtil";
import { setupPlugin } from "./util/testUtil";

describe("basic", () => {
  test("basic-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
  test("basic-2", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
  test("basic-invalid-program", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);

    await expect(evaluateProgramBothModes(testDir, "entry.tsx", resolver)).rejects.toThrow(
      "failed to parse program",
    );
  });
});

describe("atomic with media queries", () => {
  test("atomic-media-query-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
});

describe("atomic with global styles", () => {
  test("atomic-global-1", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    await evaluateProgramBothModes(testDir, "entry.tsx", resolver);
  });
});
