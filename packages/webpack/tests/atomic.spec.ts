import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import transformLoader from "../src/loaders/transformLoader";
import atomicProgramLoader from "../src/loaders/atomicProgramLoader";
import cssLoader from "../src/loaders/cssLoader";
import type { LoaderOptions } from "../src/loaders/consts";
import { loaderState, resolveRequest, runLoader, virtualImport } from "./util";

const dir = "/tmp/style-this-webpack-atomic";
mkdirSync(dir, { recursive: true });

const atomic = { atomic: true };

const transform = async (filepath: string, code: string, options: LoaderOptions = atomic) => {
  writeFileSync(filepath, code);
  const { err, result } = await runLoader(transformLoader, code, filepath, options);
  expect(err).toBeNull();
  return result!;
};

/** Loads the virtual modules the transformed file imports, like the bundler would. */
const loadVirtualModules = async (filepath: string, transformed: string, options: LoaderOptions = atomic) => {
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
    loaderState(atomic).cssFiles.clear();
    loaderState(atomic).atomicFiles.clear();
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

  it("resolves extensionless imports when the virtual module loaders transform the file", async () => {
    const filepath = `${dir}/extensionless.tsx`;
    const theme = `${dir}/theme.ts`;
    const code = `import { css } from "@style-this/core";
import { color } from "./theme";
export const cls = css\`
  color: \${color};
\`;
`;
    writeFileSync(filepath, code);
    writeFileSync(theme, `export const color = "red";\n`);

    // like webpack with `.ts` in `resolve.extensions`, the `.js` noop file of a `"type": "module"`
    // package requires fully specified imports (and Node can't resolve the `.ts` file either)
    const getResolve =
      ({ fullySpecified = true }) =>
      (context: string, request: string, cb: Parameters<typeof resolveRequest>[2]) => {
        if (!request.startsWith(".") || path.extname(request)) return resolveRequest(context, request, cb);
        if (fullySpecified) return cb(new Error(`Can't resolve '${request}'`));
        resolveRequest(context, `${request}.ts`, cb);
      };
    const { result: transformed } = await runLoader(transformLoader, code, filepath, atomic, { getResolve });
    await loaderState(atomic).cssFiles.get(`${filepath}.css`);

    // e.g. restored from webpack's persistent cache after the dependency changed, the virtual module
    // loaders transform the file again, with their own loader context
    writeFileSync(theme, `export const color = "blue";\n`);
    loaderState(atomic).cssFiles.clear();
    loaderState(atomic).atomicFiles.clear();
    const resource = virtualImport(filepath, transformed!, "style-this.atomic-program.js");
    const { err, result } = await runLoader(atomicProgramLoader, "", resource, atomic, { getResolve });

    expect(err).toBeNull();
    expect(result).toMatch(/export const cls = "cls-\w+ c-\w+"/);
  });

  it("keeps the modules of each mode apart", async () => {
    const filepath = `${dir}/modes.tsx`;
    const code = `import { css } from "@style-this/core";
export const cls = css\`
  color: red;
\`;
`;
    // e.g. two compilers in one process, the file is unchanged for the second one
    const atomicCss = (await loadVirtualModules(filepath, await transform(filepath, code), atomic)).css;
    const css = (await loadVirtualModules(filepath, await transform(filepath, code, {}), {})).css;

    expect(atomicCss).toMatch(/@layer utilities[^]*color: red/);
    expect(css).toMatch(/^\.cls-\w+ \{\s+color: red;\s+\}$/);
  });
});
