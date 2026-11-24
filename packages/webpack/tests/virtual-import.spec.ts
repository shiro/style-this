import { describe, it, expect } from "vitest";
import { noopFileImport } from "../src/loaders/consts";

describe("noopFileImport", () => {
  it("doesn't depend on the project's location", () => {
    const request = (root: string) =>
      noopFileImport(`${root}/node_modules/@style-this/webpack/style-this.css`, `${root}/src/App.tsx`);

    expect(request("/a")).toBe(request("/b/c"));
    expect(request("/a")).toBe(
      "../node_modules/@style-this/webpack/style-this.css?filepath=..%2F..%2F..%2Fsrc%2FApp.tsx",
    );
  });

  it("prefixes requests into dot-directories with `./`", () => {
    const request = noopFileImport("/a/.yarn/@style-this/webpack/style-this.css", "/a/App.tsx");

    expect(request).toBe("./.yarn/@style-this/webpack/style-this.css?filepath=..%2F..%2F..%2FApp.tsx");
  });

  it("escapes `?` and `#` in the path", () => {
    const request = noopFileImport("/a/#lib?/webpack/style-this.css", "/a/src/App.tsx");

    expect(request).toBe("../\0#lib\0?/webpack/style-this.css?filepath=..%2F..%2Fsrc%2FApp.tsx");
  });
});
