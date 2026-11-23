import { describe, it, expect } from "vitest";
import { isInNodeModules } from "../src/loaders/shared";
import transformLoader from "../src/loaders/transformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { runLoader, virtualImport } from "./util";

describe("isInNodeModules", () => {
  it.each([
    ["C:\\app\\node_modules\\lib\\index.js", true],
    // e.g. the workspace root's in monorepos
    ["/repo/node_modules/.pnpm/lib@1.0.0/node_modules/lib/index.js", true],
    ["C:\\app\\src\\node_modules.ts", false],
  ])("%s", (filepath, expected) => {
    expect(isInNodeModules(filepath)).toBe(expected);
  });
});

// the library is outside the project's `node_modules`, like the workspace root's in monorepos
it("requires dependencies resolved from the importer", async () => {
  const filepath = `${__dirname}/library-imports/entry.tsx`;
  const code = 'import { css } from "@style-this/core";\nimport { color } from "some_lib";\nexport const cls = css`color: ${color};`;\n';

  const { result } = await runLoader(transformLoader, code, filepath);
  const css = await runLoader(cssLoader, "", virtualImport(filepath, result!, "style-this.css"));

  expect(css).toEqual({ err: null, result: expect.stringContaining("color: red") });
});
