import { describe, it, expect, vi } from "vitest";
import { fromVirtualPath, toVirtualPath } from "../src/util";

vi.mock("path", async () => {
  const { win32 } = await vi.importActual<typeof import("path")>("path");
  return { default: win32 };
});

describe("virtual ids on Windows", () => {
  it("use posix paths like vite ids", () => {
    expect(toVirtualPath("C:\\app", "C:\\app\\src\\A.tsx.css")).toBe("src/A.tsx.css");
    expect(fromVirtualPath("C:\\app", "src/A.tsx.css")).toBe("C:/app/src/A.tsx.css");
  });

  it("use absolute paths across drives", () => {
    expect(toVirtualPath("C:\\app", "D:\\lib\\A.tsx.css")).toBe("D:/lib/A.tsx.css");
    expect(fromVirtualPath("C:\\app", "D:/lib/A.tsx.css")).toBe("D:/lib/A.tsx.css");
  });
});
