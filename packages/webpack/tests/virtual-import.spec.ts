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
});
