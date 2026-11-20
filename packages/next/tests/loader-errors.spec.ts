import { describe, it, expect } from "vitest";
import path from "path";
import { createRequire } from "node:module";
import webpackTransformLoader from "../src/loaders/webpackTransformLoader";
import turbopackTransformLoader from "../src/loaders/turbopackTransformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { cssFiles } from "../src/shared";

type LoaderResult = { err: Error | null | undefined; result?: string };

const runLoader = (loader: Function, code: string, resource: string) =>
  new Promise<LoaderResult>((resolve) => {
    const callback = (err: Error | null | undefined, result?: string | Buffer) =>
      resolve({ err, result: result?.toString() });
    const queryStart = resource.indexOf("?");
    loader.call(
      {
        resourcePath: queryStart === -1 ? resource : resource.slice(0, queryStart),
        resourceQuery: queryStart === -1 ? "" : resource.slice(queryStart),
        async: () => callback,
        getOptions: () => ({}),
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

/** The CSS import the transform inserted into `filepath`, as a resource for the CSS loader. */
const cssImport = (filepath: string, code: string) => {
  const source = code.match(/import "([^"]+\?filepath=[^"]+)"/)![1];
  return path.resolve(path.dirname(filepath), source);
};

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
    const css = async (code: string) => {
      const { err, result } = await transform(code);
      expect(err).toBeNull();
      return runLoader(cssLoader, "", cssImport(filepath, result!));
    };

    expect((await transform(styled("red") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect(await css(styled("red"))).toEqual({ err: null, result: expect.stringContaining("color: red") });

    // a failure after a cached evaluation must not keep the outdated CSS
    expect((await transform(styled("blue") + SYNTAX_ERROR)).err).toBeInstanceOf(Error);
    expect(await css(styled("blue"))).toEqual({ err: null, result: expect.stringContaining("color: blue") });
  });
});
