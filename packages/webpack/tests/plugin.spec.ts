import { describe, it, expect } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import webpack from "webpack";
import { StyleThisPlugin } from "../src/index";
import { noopAtomicProgramFile } from "../src/loaders/consts";
import transformLoader from "../src/loaders/transformLoader";
import cssLoader from "../src/loaders/cssLoader";
import { loaderState, runLoader, virtualImport } from "./util";

/** The loaders the rules of `StyleThisPlugin` apply to `request`. */
const loadersOf = (request: string) => {
  const { ruleSet } = webpack({ plugins: [new StyleThisPlugin()] }).newCompilationParams().normalModuleFactory;
  const [resource, resourceQuery = ""] = request.split(/(?=\?)/);
  return ruleSet
    .exec({ resource, resourceQuery, dependency: "esm", issuer: "", issuerLayer: "" })
    .flatMap((effect) => (effect.type === "use" ? [path.basename(effect.value.loader)] : []));
};

describe("StyleThisPlugin", () => {
  it.each([
    ["/app/a.js", ["transformLoader.mjs"]],
    ["/app/a.js?raw", []],
    [`${noopAtomicProgramFile}?filepath=a.js`, ["atomicProgramLoader.mjs"]],
    ["/app/node_modules/lib/a.js", []],
    ["/app/node_modules_lib/a.js", ["transformLoader.mjs"]],
  ])("applies the loaders of %s", (request, expected) => {
    expect(loadersOf(request)).toEqual(expected);
  });

  it("drops the modules of removed files and of their importers", async () => {
    const dir = "/tmp/style-this-webpack-plugin";
    mkdirSync(dir, { recursive: true });
    const filepath = `${dir}/importer.tsx`;
    const code = `import { css } from "@style-this/core";
import { color } from "./theme.ts";
export const cls = css\`color: \${color};\`;
`;
    writeFileSync(filepath, code);
    writeFileSync(`${dir}/theme.ts`, `export const color = "red";\n`);

    // the config of the loaders `runLoader` runs
    const compiler = webpack({ plugins: [new StyleThisPlugin({ useRequire: true })] });
    const { cssFiles } = loaderState();
    const cssModule = `${filepath}.css`;
    const transform = async () => {
      const { result } = await runLoader(transformLoader, code, filepath);
      await runLoader(cssLoader, "", virtualImport(filepath, result!, "style-this.css"));
      expect(cssFiles.has(cssModule)).toBe(true);
    };
    const remove = (file: string) => {
      compiler.removedFiles = new Set([file]);
      return compiler.hooks.watchRun.promise(compiler);
    };

    await transform();
    await remove(`${dir}/theme.ts`);
    expect(cssFiles.has(cssModule)).toBe(false);

    await transform();
    await remove(filepath);
    expect(cssFiles.has(cssModule)).toBe(false);
  });
});
