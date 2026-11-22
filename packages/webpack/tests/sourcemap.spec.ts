import { describe, it, expect } from "vitest";
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
import transformLoader from "../src/loaders/transformLoader";
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

describe("transform loader sourcemaps", () => {
  const filepath = "/tmp/style-this-sourcemap.tsx";

  it("maps the transformed code to the source", async () => {
    const { err, result, map } = await runLoader(transformLoader, code, filepath);

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
    const { err, result, map } = await runLoader(transformLoader, `\n${code}`, filepath, {}, {}, inputSourceMap);

    expect(err).toBeNull();
    expect(tracePosition(result!, map)).toMatchObject({ source: "/tmp/original.tsx", line: 5 });
    expect(map).toMatchObject({ sources: ["/tmp/original.tsx"], sourcesContent: [code] });
  });
});
