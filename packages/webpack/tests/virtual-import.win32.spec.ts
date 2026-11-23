import { describe, it, expect, vi } from "vitest";
import { noopFileImport } from "../src/loaders/consts";

vi.mock("path", async () => {
  const { win32 } = await vi.importActual<typeof import("path")>("path");
  return { default: win32 };
});

describe("noopFileImport on Windows", () => {
  it("uses relative requests with forward slashes", () => {
    const request = noopFileImport("C:\\app\\node_modules\\@style-this\\webpack\\style-this.css", "C:\\app\\src\\App.tsx");

    expect(request).toBe("../node_modules/@style-this/webpack/style-this.css?filepath=..%2F..%2F..%2Fsrc%2FApp.tsx");
  });

  it("uses absolute requests across drives", () => {
    const request = noopFileImport("D:\\cache\\@style-this\\webpack\\style-this.css", "C:\\app\\src\\App.tsx");

    expect(request).toBe("D:/cache/@style-this/webpack/style-this.css?filepath=C%3A%2Fapp%2Fsrc%2FApp.tsx");
  });
});
