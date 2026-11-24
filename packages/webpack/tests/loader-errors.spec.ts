import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import transformLoader from "../src/loaders/transformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { loaderState, resolveRequest, runLoader, virtualImport } from "./util";

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
    expect(loaderState().cssFiles.has(`${filepath}.css`)).toBe(false);
  });

  it("reports the resolver's error for unresolvable imports", async () => {
    const filepath = "/tmp/style-this-unresolvable.tsx";
    const code = `import { color } from "./style-this-missing";\n${styled("${color}")}`;
    const resolveError = new Error("Can't resolve './style-this-missing' in '/tmp'");
    const { result } = await runLoader(transformLoader, code, filepath, {}, {
      getResolve: () => (context, request, cb) =>
        request === "./style-this-missing" ? cb(resolveError) : resolveRequest(context, request, cb),
    });
    const { err } = await runLoader(cssLoader, "", virtualImport(filepath, result!, "style-this.css"));

    expect(err?.cause).toBe(resolveError);
  });

  it("reports the location and code frame of evaluation errors, also in dependencies", async () => {
    const dir = "/tmp/style-this-evaluation-error";
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/dep.js`, `export const color = (() => {\n  throw new Error("no color");\n})();\n`);
    const filepath = `${dir}/entry.tsx`;
    const { result } = await runLoader(transformLoader, `import { color } from "./dep.js";\n${styled("${color}")}`, filepath);
    const { err } = await runLoader(cssLoader, "", virtualImport(filepath, result!, "style-this.css"));

    expect(err?.message).toBe(`${dir}/dep.js:2:9: no color

  1 | export const color = (() => {
> 2 |   throw new Error("no color");
              ^ no color
  3 | })();
  4 | 
`);
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
