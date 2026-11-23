import { describe, it, expect } from "vitest";
import { isInNodeModules } from "../src/util";

describe("isInNodeModules", () => {
  it.each([
    ["C:\\app\\node_modules\\lib\\index.js", true],
    // e.g. the workspace root's in monorepos
    ["/repo/node_modules/.pnpm/lib@1.0.0/node_modules/lib/index.js", true],
    ["C:\\app\\src\\node_modules.ts", false],
  ])("%s", (filepath, expected) => {
    expect(isInNodeModules(filepath)).toBe(expected);
  });
});
