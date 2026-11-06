import vitePlugin from "../src/index";
import { describe, test, expect } from "vitest";

describe("vite simple", () => {
  test("name", async () => {
    const { name } = vitePlugin();
    expect(name).toEqual("vite:style-this");
  });
});

describe("ssr", () => {
  test("@style-this/core is not externalized", async () => {
    const plugin = vitePlugin();
    const config: Parameters<typeof plugin.config>[0] = { ssr: { noExternal: "some-lib" } };
    await plugin.config(config);
    expect(config.ssr?.noExternal).toEqual(["some-lib", "@style-this/core"]);

    const allConfig: Parameters<typeof plugin.config>[0] = { ssr: { noExternal: true } };
    await plugin.config(allConfig);
    expect(allConfig.ssr?.noExternal).toBe(true);
  });
});
