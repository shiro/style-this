import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import transformLoader from "../src/loaders/transformLoader";
import atomicProgramLoader from "../src/loaders/atomicProgramLoader";
import cssLoader from "../src/loaders/cssLoader";
import { atomicFiles, cssFiles } from "../src/shared";
import { runLoader, virtualImport } from "./util";

const dir = "/tmp/style-this-webpack-atomic";
mkdirSync(dir, { recursive: true });

const options = { atomic: true };

const transform = async (filepath: string, code: string) => {
  writeFileSync(filepath, code);
  const { err, result } = await runLoader(transformLoader, code, filepath, options);
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
    css: await load(cssLoader, "style-this.css"),
  };
};

describe("atomic mode", () => {
  it("serves the class modules and the CSS with the atomic CSS each file uses", async () => {
    const filepath = `${dir}/serves.tsx`;
    const code = `import { css } from "@style-this/core";
export const cls = css\`
  margin: 0;
  margin-top: 4px;
  &:hover { color: red; }
\`;
`;
    const transformed = await transform(filepath, code);
    const modules = await loadVirtualModules(filepath, transformed);
    expect(modules).toMatchInlineSnapshot(`
      {
        "classes": "export const cls = "cls-olubkx m-S4bqM mt-Db_Du"",
        "css": ".cls-olubkx {   &:hover { color: red; } }
      @layer theme, base, components, utilities;
      @layer utilities {
      @layer r0, r1;
      @layer r0 {
      .m-S4bqM { margin: 0 }
      }
      @layer r1 {
      .mt-Db_Du { margin-top: 4px }
      }
      }",
      }
    `);

    // Turbopack runs loaders in several processes, the virtual module loaders transform the file again if this one didn't
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
