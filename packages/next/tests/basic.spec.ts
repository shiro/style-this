import { describe, it, expect, vi } from "vitest";
import type { Configuration } from "webpack";
import { withStyleThis } from "../src/index";

describe("withStyleThis", () => {
  it("adds its config to the user's config without mutating it", () => {
    const turbopack = { resolveAlias: { foo: "./foo" }, rules: { "*.svg": { loaders: ["svg-loader"] } } };
    const userWebpack = vi.fn((config: Configuration) => config);
    const config = withStyleThis({ reactStrictMode: true, turbopack, webpack: userWebpack });

    expect(turbopack).toEqual({ resolveAlias: { foo: "./foo" }, rules: { "*.svg": { loaders: ["svg-loader"] } } });
    expect(config.reactStrictMode).toBe(true);
    expect(config.turbopack?.resolveAlias).toMatchObject({
      foo: "./foo",
      "@style-this/core/atomic": "@style-this/next/style-this.atomic.css",
    });
    expect(Object.keys(config.turbopack?.rules ?? {})).toEqual([
      "*.svg",
      "*.tsx",
      "style-this.module.css",
      "style-this.global.css",
      "style-this.atomic-program.js",
    ]);

    // the user's webpack config runs after ours
    const webpackConfig = { module: { rules: [] }, plugins: [] };
    config.webpack!(webpackConfig, {} as any);
    expect(userWebpack).toHaveBeenCalledWith(webpackConfig, {});
    expect(webpackConfig.module.rules).toHaveLength(3);
  });
});
