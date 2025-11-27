import path from "path";
import { initializeStyleThis } from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import type { RawLoaderDefinitionFunction } from "webpack";

type LoaderType = RawLoaderDefinitionFunction<{}>;

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "css";
const mocks = new Map<string, string>();

const turbopackTransformLoader: LoaderType = function (code, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  // TODO remove this when done
  this.cacheable(false);

  const resolveSync = this.getResolve({ dependencyType: "esm" });

  const resolve = (token: string, importer: string): Promise<string> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((resolvePromise, rejectPromise) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          rejectPromise(err);
        } else if (result) {
          this.addDependency(result);
          resolvePromise(result);
        } else {
          rejectPromise(new Error(`Cannot resolve ${token}`));
        }
      });
    });
  };

  const cwd = process.cwd();

  const loadFile = async (
    importSourceId: string,
  ): Promise<[string, string]> => {
    if (mocks.has(importSourceId)) {
      const filepath = require.resolve(importSourceId);
      return [filepath, mocks.get(importSourceId)!];
    }

    let filepathWithQuery = await resolve(importSourceId, "./index.ts");

    if (!filepathWithQuery)
      throw new Error(`webpack failed to resolve import '${importSourceId}'`);

    let [filepath, _query] = filepathWithQuery.split("?", 2);

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

  (async () => {
    if (!styleThis) {
      await initializeStyleThis();
      styleThis = new Transformer({
        loadFile,
        cssFileStore: cssFiles,
        exportCache,
        cssExtension,
      });
    }

    const filepath = this.resourcePath;
    const cssFilepath = `${filepath}.module.${cssExtension}`;
    console.log(cssFilepath);

    // console.log("LOAD style-this", this.resourcePath);
    // console.log(code);

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      undefined,
    );

    if (!transformedResult) {
      filesContainingStyledTemplates.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }
    filesContainingStyledTemplates.add(filepath);

    const css = Buffer.from(transformedResult.code).toString("base64");
    const resultCodeWithImport = `import "data:text/css;base64,${css}";\n${transformedResult.code}`;

    this.callback(
      null,
      resultCodeWithImport,
      // TODO sourcemap
    );
  })();

  // transform(transformServices, contentStr, asyncResolve).then(
  //   async (result: Result) => {
  //     if (result.cssText) {
  //       await Promise.all(
  //         result.dependencies?.map((dep: any) =>
  //           asyncResolve(dep, this.resourcePath),
  //         ) ?? [],
  //       );
  //
  //       const css = Buffer.from(result.cssText).toString("base64");
  //       const importStatement = `import "data:text/css;base64,${css}";`;
  //       const finalCode = insertImportStatement(result.code, importStatement);
  //
  //       this.callback(null, finalCode, result.sourceMap ?? undefined);
  //       return;
  //     }
  //
  //     this.callback(null, result.code, result.sourceMap ?? undefined);
  //   },
  //   (err: Error) => this.callback(err),
  // );
};

export default turbopackTransformLoader;
