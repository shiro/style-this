import { type RawLoaderDefinitionFunction } from "webpack";
import remapping, { type SourceMapInput } from "@jridgewell/remapping";
import { readFile } from "fs/promises";
import { createRequire } from "node:module";
import path from "path";

const require = createRequire(import.meta.url);

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;
type InputSourceMap = Parameters<RawLoaderDefinitionFunction>[1];

/** The transform's `sourcemap`, traced through the map of the loaders that ran before. */
export const chainSourceMap = (sourcemap: string, inputSourceMap: InputSourceMap) =>
  inputSourceMap
    ? remapping([sourcemap, inputSourceMap as SourceMapInput], () => null)
    : JSON.parse(sourcemap);

/**
 * Whether `filepath` is inside any `node_modules`, e.g. the workspace root's in monorepos. `/` and `\`
 * separators are both accepted on Windows.
 */
export const isInNodeModules = (filepath: string) => /[\\/]node_modules[\\/]/.test(filepath);

export const makeLoadFile = (ctx: LoaderCtx) => {
  // the virtual module loaders resolve the imports of the source file with the options of their noop
  // file, `.js` files of `"type": "module"` packages (like it) would require fully specified imports
  const resolveSync = ctx.getResolve({ dependencyType: "esm", fullySpecified: false });
  const cwd = process.cwd();

  const importerDir = (importer: string) =>
    path.isAbsolute(importer) ? path.dirname(importer) : path.join(cwd, path.dirname(importer));

  const resolve = (
    token: string,
    importer: string,
  ): Promise<[resolveError: Error | null, resolved: string | undefined]> => {
    const context = importerDir(importer);
    return new Promise((ok) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          ok([err, undefined]);
        } else if (result) {
          ctx.addDependency(result.split("?", 1)[0]);
          ok([null, result]);
        } else {
          ok([null, undefined]);
        }
      });
    });
  };

  const loadFile = async (
    importSourceId: string,
    importer: string,
  ): Promise<[string, string]> => {
    const [resolveError, resolved] = await resolve(importSourceId, importer);
    const [resolvedPath, query] = resolved?.split("?", 2) ?? [];

    // modules with a query (e.g. `?raw`) are generated from the file by the compiler
    if (query !== undefined) {
      return [resolved!, await readFile(resolvedPath, "utf-8")];
    }

    let filepath = resolved ?? importSourceId;

    if (
      !isInNodeModules(filepath) &&
      !importSourceId.startsWith("@style-this/")
    ) {
      try {
        const raw = await readFile(filepath, "utf-8");
        return [filepath, raw];
      } catch (err) {}
    }

    // for anything inside node_modules, use Node's dependency resolution instead, as vite might give us the
    // bundled one (that might not yet exist on disk)
    // also do not load the contents, the transformer should require(...) it as-is
    // like Node from the importer, monorepo packages can have their own dependencies, then from the project
    // for files outside of it
    // this also covers imports webpack failed to resolve (e.g. Node builtins for web targets), if Node can't
    // resolve them either, the resolver's error is the accurate one
    try {
      filepath = require.resolve(importSourceId, { paths: [importerDir(importer), cwd] });
    } catch (err) {
      throw resolveError ?? err;
    }
    return [filepath, ""];
  };

  return loadFile;
};
