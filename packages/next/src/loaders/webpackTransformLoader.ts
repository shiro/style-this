/**
 * This was inspired by  https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/index.ts
 */

// import zlib from "node:zlib";

// import type { PluginOptions, Preprocessor, Result } from "@wyw-in-js/transform";
// import { transform, TransformCacheCollection } from "@wyw-in-js/transform";
// import { PartialServices } from "@wyw-in-js/transform/types/transform/helpers/withDefaultServices";
import path from "path";
import type { RawLoaderDefinitionFunction } from "webpack";

// import { insertImportStatement } from "../utils/insert-import";
// import { convertSourceMap } from "../utils/source-map";
// import { LINARIA_GLOBAL_EXTENSION, LINARIA_MODULE_EXTENSION } from "./consts";
import { initializeStyleThis } from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";

export type LinariaLoaderOptions = {
  /**
   * Eanbles a prefixer for css rules.
   * @default true
   */
  prefixer?: boolean;
  // preprocessor?: Preprocessor;
  sourceMap?: boolean;
};

type LoaderType = RawLoaderDefinitionFunction<
  LinariaLoaderOptions & { name: string }
>;

// const cache = new TransformCacheCollection();

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "css";
const mocks = new Map<string, string>();

const webpackTransformLoader: LoaderType = function (code, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  // TODO remove this when done
  this.cacheable(false);

  // const { prefixer = true, ...pluginOptions } = this.getOptions() || {};

  // const contentStr = content.toString();
  //
  // const asyncResolve = (token: string, importer: string): Promise<string> => {
  //   const context = path.isAbsolute(importer)
  //     ? path.dirname(importer)
  //     : path.join(process.cwd(), path.dirname(importer));
  //   return new Promise((resolve, reject) => {
  //     this.resolve(context, token, (err, result) => {
  //       if (err) {
  //         console.error(err);
  //         reject(err);
  //       } else if (result) {
  //         this.addDependency(result);
  //         resolve(result);
  //       } else {
  //         reject(new Error(`Cannot resolve ${token}`));
  //       }
  //     });
  //   });
  // };

  // const filename = path.basename(
  //   this.resourcePath,
  //   path.extname(this.resourcePath),
  // );

  // const transformServices = {
  //   options: {
  //     filename: this.resourcePath,
  //     inputSourceMap: convertSourceMap(inputSourceMap, this.resourcePath),
  //     root: process.cwd(),
  //     prefixer,
  //     pluginOptions,
  //   },
  //   cache,
  // } as PartialServices;

  // transform(transformServices, contentStr, asyncResolve).then(
  //   async (result: Result) => {
  //     if (result.cssText) {
  //       const { cssText } = result;
  //
  //       await Promise.all(
  //         result.dependencies?.map((dep: any) => {
  //           return asyncResolve(dep, this.resourcePath);
  //         }) ?? [],
  //       );
  //
  //       try {
  //         const compressedCss = zlib.gzipSync(cssText);
  //         const encodedCss = Buffer.from(compressedCss).toString("base64");
  //
  //         const isGlobalStyle = filename.endsWith(LINARIA_GLOBAL_EXTENSION);
  //         const cssSuffix = isGlobalStyle
  //           ? `${LINARIA_GLOBAL_EXTENSION}.css`
  //           : `${LINARIA_MODULE_EXTENSION}.css`;
  //         const cssFilename = `${filename}${cssSuffix}`;
  //
  //         /// Example: import "./Component.linaria.module.css!=!./Component?./Component.linaria.module.css?css=..."
  //         /// The "!=!" syntax tells webpack to use specific loaders for this import
  //         /// The "?" parameter is needed for Next.js compatibility as it ignores the "!=!" directive
  //         /// The "css=" parameter is used to pass the compressed CSS to the output loader
  //
  //         const importStatement = `import "./${cssFilename}!=!./${filename}?./${cssFilename}?css=${encodedCss}"`;
  //
  //         const finalCode = insertImportStatement(result.code, importStatement);
  //
  //         this.callback(null, finalCode, result.sourceMap ?? undefined);
  //       } catch (err) {
  //         this.callback(err as Error);
  //       }
  //
  //       return;
  //     }
  //
  //     this.callback(null, result.code, result.sourceMap ?? undefined);
  //   },
  //   (err: Error) => this.callback(err),
  // );

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
    const isGlobalStyle = filepath.endsWith(".global.tsx");
    const qualifier = isGlobalStyle ? "global" : "module";
    const cssFilepath = `${filepath}.${qualifier}.${cssExtension}`;

    //         const cssFilename = `${filename}${cssSuffix}`;

    // console.log("LOAD style-this", this.resourcePath);
    // console.log(code);

    // const request = `${cssFilepath}!=!${cssLoader}!${filepath}`;
    const request = `${cssFilepath}!=!${filepath}?${cssFilepath}`;

    const importSource = this.utils.contextify(
      this.context || this.rootContext,
      request,
    );

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      importSource,
    );

    if (!transformedResult) {
      filesContainingStyledTemplates.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }
    filesContainingStyledTemplates.add(filepath);

    // console.log(transformedResult.code);

    this.callback(
      null,
      // `import ${stringifiedRequest};\n${transformedResult.code}`,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default webpackTransformLoader;
