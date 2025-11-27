import { describe, it, expect } from "vitest";
import styleThisWebpackPlugin, { StyleThisWebpackPlugin } from "../src/index";
import styleThisSolidJsWebpackPlugin, { StyleThisSolidJsWebpackPlugin } from "../src/solid-js";

describe("StyleThis Webpack Plugin", () => {
  it("should create plugin instance", () => {
    const plugin = styleThisWebpackPlugin();
    expect(plugin).toBeInstanceOf(StyleThisWebpackPlugin);
  });

  it("should accept options", () => {
    const plugin = styleThisWebpackPlugin({
      cssExtension: "scss",
      filter: [/\.tsx?$/]
    });
    expect(plugin.cssExtension).toBe("scss");
  });

  it("should have mocks property", () => {
    const plugin = styleThisWebpackPlugin();
    expect(plugin.__mocks).toBeInstanceOf(Map);
  });
});

describe("StyleThis SolidJS Webpack Plugin", () => {
  it("should create plugin instance", () => {
    const plugin = styleThisSolidJsWebpackPlugin();
    expect(plugin).toBeInstanceOf(StyleThisSolidJsWebpackPlugin);
  });

  it("should accept filter options", () => {
    const plugin = styleThisSolidJsWebpackPlugin({
      filter: [/\.tsx$/]
    });
    expect(plugin).toBeInstanceOf(StyleThisSolidJsWebpackPlugin);
  });
});

