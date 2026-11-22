import { describe, it, expect } from "vitest";
import transformLoader from "../src/loaders/transformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { cssFiles } from "../src/shared";
import { runLoader, virtualImport } from "./util";

const styled = (color: string) => `import { css } from "@style-this/core";
export const cls = css\`
  color: ${color};
\`;
`;

const SYNTAX_ERROR = "\nconst = ;\n";

describe("transform loader errors", () => {
  it("reports syntax errors instead of hanging", async () => {
    const filepath = "/tmp/style-this-syntax-error.tsx";
    const { err } = await runLoader(transformLoader, styled("red") + SYNTAX_ERROR, filepath);

    expect(err).toBeInstanceOf(Error);
    expect(cssFiles.has(`${filepath}.css`)).toBe(false);
  });

  it("evaluates the CSS once a syntax error is fixed", async () => {
    const filepath = "/tmp/style-this-recover.tsx";
    const transform = (code: string) => runLoader(transformLoader, code, filepath);
    const css = async (code: string) => {
      const { err, result } = await transform(code);
      expect(err).toBeNull();
      return runLoader(cssLoader, "", virtualImport(filepath, result!, "style-this.css"));
    };

    expect((await transform(styled("red") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect(await css(styled("red"))).toEqual({ err: null, result: expect.stringContaining("color: red") });

    // a failure after a cached evaluation must not keep the outdated CSS
    expect((await transform(styled("blue") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect(await css(styled("blue"))).toEqual({ err: null, result: expect.stringContaining("color: blue") });
  });
});
