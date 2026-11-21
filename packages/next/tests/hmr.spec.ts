import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import turbopackTransformLoader from "../src/loaders/turbopackTransformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { runLoader, virtualImport } from "./util";

const dir = "/tmp/style-this-next-hmr";
mkdirSync(dir, { recursive: true });

const options = { bundler: "turbopack" };

describe("next dev edits", () => {
  it("serves the CSS of files gaining and losing styles", async () => {
    const filepath = `${dir}/gaining.tsx`;
    const transform = async (code: string) => {
      writeFileSync(filepath, code);
      const { err, result } = await runLoader(turbopackTransformLoader, code, filepath, options);
      expect(err).toBeNull();
      return result!;
    };
    const css = async (cssImport: string) => runLoader(cssLoader, "", cssImport, options);
    const styled = (color: string) => `import { css } from "@style-this/core";
export const cls = css\`
  color: ${color};
\`;
`;
    const unstyled = `export const value = 1;\n`;

    expect(await transform(unstyled)).toBe(unstyled);
    const cssImport = virtualImport(filepath, await transform(styled("red")), "style-this.module.css");
    expect(await css(cssImport)).toEqual({ err: null, result: expect.stringContaining("color: red") });

    // the CSS loader runs again on edits, while the stylesheet is still imported
    expect(await transform(unstyled)).toBe(unstyled);
    expect(await css(cssImport)).toEqual({ err: null, result: "" });

    await transform(styled("blue"));
    expect(await css(cssImport)).toEqual({ err: null, result: expect.stringContaining("color: blue") });
  });
});
