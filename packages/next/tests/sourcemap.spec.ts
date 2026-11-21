import { describe, it, expect } from "vitest";
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
import webpackTransformLoader from "../src/loaders/webpackTransformLoader";
import turbopackTransformLoader from "../src/loaders/turbopackTransformLoader";
import { runLoader } from "./util";

const code = `import { css } from "@style-this/core";
export const cls = css\`
  color: red;
\`;
export const after = cls;
`;

/** Where `after` in the transformed code maps to. */
const tracePosition = (output: string, map: unknown) => {
  const lines = output.split("\n");
  const line = lines.findIndex((line) => line.includes("export const after"));
  return originalPositionFor(new TraceMap(map as any), {
    line: line + 1,
    column: lines[line].indexOf("after"),
  });
};

describe.each([
  ["webpack", webpackTransformLoader],
  ["turbopack", turbopackTransformLoader],
])("next %s transform loader sourcemaps", (name, loader) => {
  const filepath = `/tmp/style-this-${name}-sourcemap.tsx`;

  it("maps the transformed code to the source", async () => {
    const { err, result, map } = await runLoader(loader, code, filepath);

    expect(err).toBeNull();
    expect(tracePosition(result!, map)).toMatchObject({ source: filepath, line: 5, column: 13 });
  });

  it("maps through the input sourcemap", async () => {
    // a previous loader that prepended a line to `original.tsx`, only the line starts are mapped
    const inputSourceMap = {
      version: 3,
      sources: ["/tmp/original.tsx"],
      sourcesContent: [code],
      names: [],
      mappings: ";AAAA;AACA;AACA;AACA;AACA",
    };
    const { err, result, map } = await runLoader(loader, `\n${code}`, filepath, {}, {}, inputSourceMap);

    expect(err).toBeNull();
    expect(tracePosition(result!, map)).toMatchObject({ source: "/tmp/original.tsx", line: 5 });
    expect(map).toMatchObject({ sources: ["/tmp/original.tsx"], sourcesContent: [code] });
  });
});
