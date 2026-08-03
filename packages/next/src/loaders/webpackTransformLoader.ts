import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import { createRequire } from "node:module";
import { makeLoadFile } from "./shared";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
        atomic: process.env.ATOMIC === '1',
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    
    // Use the noop CSS file that exists on disk
    const noopFilepath = path.resolve(
      __dirname,
      `../../style-this.${qualifier}.css`,
    );
    const noopFilepathRelative = path.relative(
      path.dirname(filepath),
      noopFilepath,
    );

    // Import the noop CSS file with a query parameter pointing to the original source
    const importSource = `${noopFilepathRelative}?filepath=${filepath}&time=${+new Date()}`;
    
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
    }

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      skipCssEval,
      importSource,
    );

    if (!transformedResult) {
      filesContainingStyledTemplates.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }
    filesContainingStyledTemplates.add(filepath);

    // If we have CSS from the transform result, resolve the CSS promise
    if (cssPromiseResolve && transformedResult.css) {
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

