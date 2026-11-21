import { describe, it, expect, vi } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import turbopackTransformLoader from "../src/loaders/turbopackTransformLoader";
import atomicProgramLoader from "../src/loaders/atomicProgramLoader";
import cssLoader from "../src/loaders/cssLoader";
import { atomicFiles, cssFiles } from "../src/shared";
import { runLoader, virtualImport } from "./util";

vi.hoisted(() => {
  process.env.ATOMIC = "1";
});

const dir = "/tmp/style-this-next-atomic";
mkdirSync(dir, { recursive: true });

const options = { bundler: "turbopack" };

const transform = async (filepath: string, code: string) => {
  writeFileSync(filepath, code);
  const { err, result } = await runLoader(turbopackTransformLoader, code, filepath);
  expect(err).toBeNull();
  return result!;
};

/** Loads the virtual modules the transformed file imports, like the bundler would. */
const loadVirtualModules = async (filepath: string, transformed: string) => {
  const load = async (loader: Function, noopFile: string) => {
    if (!transformed.includes(noopFile)) return;
    const module = await runLoader(loader, "", virtualImport(filepath, transformed, noopFile), options);
    expect(module.err).toBeNull();
    return module.result;
  };
  return {
    classes: await load(atomicProgramLoader, "style-this.atomic-program.js"),
    css: await load(cssLoader, "style-this.module.css"),
  };
};

describe("next atomic mode", () => {
  it("serves the class modules and the CSS with the atomic CSS each file uses", async () => {
    const filepath = `${dir}/serves.tsx`;
    const code = `import { css } from "@style-this/core";
export const cls = css\`
  margin-top: 4px;
  margin: 0;
  &:hover { color: red; }
\`;
`;
    const transformed = await transform(filepath, code);
    const modules = await loadVirtualModules(filepath, transformed);
    expect(modules).toMatchInlineSnapshot(`
      {
        "classes": "export const cls = "cls-uzcx2b m-sy5do mt-DB_jf"",
        "css": ".cls-uzcx2b {   &:hover { color: red; } }
      @layer theme, base, components, utilities;
      @layer utilities {
      @layer r0, r1;
      @layer r0 {
      .m-sy5do { margin: 0 }
      }
      @layer r1 {
      .mt-DB_jf { margin-top: 4px }
      }
      }",
      }
    `);

    // Turbopack runs loaders in several processes, the loaders transform the file again if this one didn't
    cssFiles.clear();
    atomicFiles.clear();
    expect(await loadVirtualModules(filepath, transformed)).toEqual(modules);
  });

  it("drops the atomic CSS of previous evaluations", async () => {
    const filepath = `${dir}/drops.tsx`;
    const styled = await transform(
      filepath,
      `import { css } from "@style-this/core";
export const cls = css\`
  color: blue;
\`;
`,
    );
    expect((await loadVirtualModules(filepath, styled)).css).toContain("color: blue");

    // the loaders run again on edits, while the virtual modules are still imported
    for (const unstyled of [
      `import { css } from "@style-this/core";\nexport const value = 1;\n`,
      `export const value = 1;\n`,
    ]) {
      await transform(filepath, unstyled);
      expect(await loadVirtualModules(filepath, styled)).toEqual({ classes: "", css: "" });
    }
  });
});
