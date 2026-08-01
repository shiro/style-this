import path from "path";
import { initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles, dependencyStore } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import type { RawLoaderDefinitionFunction } from "webpack";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { makeLoadFile } from "./shared";

const __dirname = dirname(fileURLToPath(import.meta.url));

type LoaderType = RawLoaderDefinitionFunction<{}>;

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "css";
const mocks = new Map<string, string>();

const turbopackTransformLoader: LoaderType = function (code, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

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
        wrapSelectorsWithGlobal: true,
        useRequire: true,
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    const noopFilepath = path.resolve(
      __dirname,
      `../../style-this.${qualifier}.css`,
    );
    const noopFilepathRelative = path.relative(
      path.dirname(filepath),
      noopFilepath,
    );

    // we explicitly cache-bust here
    const importSource = `${noopFilepathRelative}?filepath=${filepath}&time=${+new Date()}`;
    
    // Create CSS cache entry for this file
    const cssFilepath = `${filepath}.${cssExtension}`;
    const skipCssEval = cssFiles.has(cssFilepath);
    
    if (!skipCssEval) {
      let resolve: import("@style-this/core/compiler").CssCachEntry["resolve"] | undefined;
      const entry = new Promise((_resolve, _reject) => {
        resolve = _resolve;
      }) as import("@style-this/core/compiler").CssCachEntry;
      entry.resolve = resolve!;
      entry.code = code.toString();
      
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
      dependencyStore.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }

    filesContainingStyledTemplates.add(filepath);
    dependencyStore.set(filepath, this.getDependencies());

    this.addDependency(noopFilepath);

    this.callback(
      null,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default turbopackTransformLoader;
