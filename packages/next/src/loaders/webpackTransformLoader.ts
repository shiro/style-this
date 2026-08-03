import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import { createRequire } from "node:module";
import { makeLoadFile } from "./shared";

type LoaderType = RawLoaderDefinitionFunction<{}>;

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

  const loadFile = makeLoadFile(this, mocks);

  (async () => {
    if (!styleThis) {
      await initializeStyleThis();
      const requireFn = createRequire(import.meta.url);
      styleThis = new Transformer({
        cwd: process.cwd(),
        ignoredImports: {},
        loadFile,
        createRequire: requireFn,
        cssCache: cssFiles,
        valueCache: exportCache,
        cssExtension,
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    const cssFilepathForImport = `${filepath}.${qualifier}.${cssExtension}`;

    const importSourceRequest = `${cssFilepathForImport}!=!${filepath}?${cssFilepathForImport}`;
    const importSource = this.utils.contextify(
      this.context || this.rootContext,
      importSourceRequest,
    );
    
    // Create CSS cache entry for this file
    // Note: The cache key should NOT include the qualifier, only the css extension
    const cssFilepath = `${filepath}.${cssExtension}`;
    const skipCssEval = cssFiles.has(cssFilepath);
    
    let cssPromiseResolve: ((css: string) => void) | undefined;
    if (!skipCssEval) {
      let resolve: import("@style-this/core/compiler").CssCachEntry["resolve"] | undefined;
      const entry = new Promise((_resolve, _reject) => {
        resolve = _resolve;
      }) as import("@style-this/core/compiler").CssCachEntry;
      entry.resolve = resolve!;
      entry.code = code.toString();
      
      // Store the resolve function so we can call it after transform
      cssPromiseResolve = (css: string) => {
        entry.resolve(css);
      };
      
      cssFiles.set(cssFilepath, entry);
      console.log("WebpackTransformLoader - created CSS cache entry for:", cssFilepath);
    }

    console.log("WebpackTransformLoader - transforming:", filepath);
    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      skipCssEval,
      importSource,
    );

    console.log("WebpackTransformLoader - transform result:", !!transformedResult, "has code:", !!transformedResult?.code);
    if (!transformedResult) {
      console.log("WebpackTransformLoader - no transform result, returning original code");
      filesContainingStyledTemplates.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }
    filesContainingStyledTemplates.add(filepath);

    // If we have CSS from the transform result, resolve the CSS promise
    if (cssPromiseResolve && transformedResult.css) {
      console.log("WebpackTransformLoader - resolving CSS:", transformedResult.css?.substring?.(0, 100));
      cssPromiseResolve(transformedResult.css);
    }

    this.callback(
      null,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default webpackTransformLoader;

