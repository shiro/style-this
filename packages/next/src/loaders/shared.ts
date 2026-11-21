import { type RawLoaderDefinitionFunction } from "webpack";
import { readFile } from "fs/promises";
import { createRequire } from "node:module";
import path from "path";

const require = createRequire(import.meta.url);

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;

/** Whether `filepath` is inside `cwd`'s `node_modules`, `/` and `\` separators are both accepted on Windows. */
export const isInNodeModules = (cwd: string, filepath: string) =>
  path.relative(cwd, filepath).split(path.sep, 1)[0] === "node_modules";

export const makeLoadFile = (ctx: LoaderCtx) => {
  const resolveSync = ctx.getResolve({ dependencyType: "esm" });
  const cwd = process.cwd();

  const resolve = (
    token: string,
    importer: string,
  ): Promise<string | undefined> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((ok) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          ok(undefined);
        } else if (result) {
          ctx.addDependency(result.split("?", 1)[0]);
          ok(result);
        } else {
          ok(undefined);
        }
      });
    });
  };

  const loadFile = async (
    importSourceId: string,
    importer: string,
  ): Promise<[string, string]> => {
    const resolved = await resolve(importSourceId, importer);
    const [resolvedPath, query] = resolved?.split("?", 2) ?? [];

    // modules with a query (e.g. `?raw`) are generated from the file by the compiler
    if (query !== undefined) {
      return [resolved!, await readFile(resolvedPath, "utf-8")];
    }

    let filepath = resolved ?? importSourceId;

    if (
      !isInNodeModules(cwd, filepath) &&
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
    filepath = require.resolve(importSourceId);
    return [filepath, ""];
  };

  return loadFile;
};
