import vitePlugin from "../src/index";
import { describe, test, expect } from "vitest";

describe("vite simple", () => {
  test("name", async () => {
    const { name } = vitePlugin();
    expect(name).toEqual("vite:style-this");
  });
});
