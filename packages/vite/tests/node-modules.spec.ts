import { describe, it, expect, vi } from "vitest";
import { isInNodeModules } from "../src/util";

// simulate Windows: `process.cwd()` uses `\`, resolved ids may use either separator
vi.mock("path", async (importOriginal) => {
  const { win32 } = await importOriginal<typeof import("path")>();
  return { ...win32, default: win32 };
});

describe("isInNodeModules on Windows", () => {
  it.each([
    ["C:\\app\\node_modules\\lib\\index.js", true],
    ["C:/app/node_modules/lib/index.js", true],
    ["C:\\app\\src\\node_modules.ts", false],
    ["C:\\other\\node_modules\\lib\\index.js", false],
  ])("%s", (filepath, expected) => {
    expect(isInNodeModules("C:\\app", filepath)).toBe(expected);
  });
});
