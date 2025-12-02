import path from "path";
import { initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles, dependencyStore } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import type { RawLoaderDefinitionFunction } from "webpack";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
      styleThis = new Transformer({
        loadFile,
        cssFileStore: cssFiles,
        exportCache,
        cssExtension,
        wrapSelectorsWithGlobal: true,
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

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
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
