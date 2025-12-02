import { type RawLoaderDefinitionFunction } from "webpack";
import { readFile } from "fs/promises";
import path from "path";

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;

export const makeLoadFile = (ctx: LoaderCtx, mocks: Map<string, string>) => {
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
          ctx.addDependency(result);
          ok(result);
        } else {
          ok(undefined);
        }
      });
    });
  };

  const loadFile = async (
    importSourceId: string,
  ): Promise<[string, string]> => {
    if (mocks.has(importSourceId)) {
      const filepath = require.resolve(importSourceId);
      return [filepath, mocks.get(importSourceId)!];
    }

    let filepath =
      (await resolve(importSourceId, "./index.ts")) ?? importSourceId;

    if (
      !filepath.startsWith(`${cwd}/node_modules/`) &&
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
