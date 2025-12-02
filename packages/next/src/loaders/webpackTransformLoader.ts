import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";
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
      styleThis = new Transformer({
        loadFile,
        cssFileStore: cssFiles,
        exportCache,
        cssExtension,
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    const cssFilepath = `${filepath}.${qualifier}.${cssExtension}`;

    const importSourceRequest = `${cssFilepath}!=!${filepath}?${cssFilepath}`;
    const importSource = this.utils.contextify(
      this.context || this.rootContext,
      importSourceRequest,
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

    this.callback(
      null,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default webpackTransformLoader;
