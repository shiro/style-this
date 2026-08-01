import { describe, it, expect } from "vitest";
import styleThisLoader, { NextCSSLoader } from "../src/index";

describe("StyleThis Webpack Loader", () => {
  it("should export a loader function", () => {
    expect(typeof styleThisLoader).toBe("function");
  });

  it("should export NextCSSLoader path", () => {
    expect(typeof NextCSSLoader).toBe("string");
    expect(NextCSSLoader).toContain("cssLoader");
  });
});

