import { describe, it, expect } from "vitest";
import path from "path";
import { createRequire } from "node:module";
import webpackTransformLoader from "../src/loaders/webpackTransformLoader";
import turbopackTransformLoader from "../src/loaders/turbopackTransformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { cssFiles } from "../src/shared";

type LoaderResult = { err: Error | null | undefined; result?: string };

const runLoader = (loader: Function, code: string, resourcePath: string) =>
  new Promise<LoaderResult>((resolve) => {
    const callback = (err: Error | null | undefined, result?: string | Buffer) =>
      resolve({ err, result: result?.toString() });
    loader.call(
      {
        resourcePath,
        resourceQuery: "",
        async: () => callback,
        callback,
        cacheable: () => {},
        addDependency: () => {},
        getDependencies: () => [],
        getResolve:
          () =>
          (context: string, request: string, cb: (err: Error | null, result?: string) => void) => {
            try {
              cb(null, createRequire(path.join(context, "noop.js")).resolve(request));
            } catch (err) {
              cb(err as Error);
            }
          },
      },
      Buffer.from(code),
    );
  });

const styled = (color: string) => `import { css } from "@style-this/core";
export const cls = css\`
  color: ${color};
\`;
`;

const SYNTAX_ERROR = "\nconst = ;\n";

describe.each([
  ["webpack", webpackTransformLoader],
  ["turbopack", turbopackTransformLoader],
])("next %s transform loader errors", (name, loader) => {
  it("reports syntax errors instead of hanging", async () => {
    const filepath = `/tmp/style-this-${name}-syntax-error.tsx`;
    const { err } = await runLoader(loader, styled("red") + SYNTAX_ERROR, filepath);

    expect(err).toBeInstanceOf(Error);
    expect(cssFiles.has(`${filepath}.css`)).toBe(false);
  });
});

// the webpack loader's evaluations use dynamic `import()`, which vitest's module runner doesn't support
describe("next turbopack transform loader errors", () => {
  it("evaluates the CSS once a syntax error is fixed", async () => {
    const filepath = "/tmp/style-this-turbopack-recover.tsx";
    const transform = (code: string) => runLoader(turbopackTransformLoader, code, filepath);
    const css = () => runLoader(cssLoader, "", filepath);

    expect((await transform(styled("red") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect((await transform(styled("red"))).err).toBeNull();
    expect(await css()).toEqual({ err: null, result: expect.stringContaining("color: red") });

    // a failure after a cached evaluation must not keep the outdated CSS
    expect((await transform(styled("blue") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect((await transform(styled("blue"))).err).toBeNull();
    expect(await css()).toEqual({ err: null, result: expect.stringContaining("color: blue") });
  });
});
