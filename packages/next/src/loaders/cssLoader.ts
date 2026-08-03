import type { RawLoaderDefinitionFunction } from "webpack";
import { cssFiles, dependencyStore } from "../shared";
type Loader = RawLoaderDefinitionFunction;

const cssLoader: Loader = function webpack5LoaderPlugin(code, inputSourceMap) {
  const callback = this.async();
  // TODO remove this when done
  this.cacheable(false);

  let filepath = this.resourcePath;

  if (this.resourceQuery.startsWith("?filepath=")) {
    filepath = this.resourceQuery.slice("?filepath=".length).split("&")[0];
  }

  const css = cssFiles.get(`${filepath}.css`);

  // this.clearDependencies();
  // this.addDependency(filepath);

  if (!css) {
    // If CSS is not in cache yet, return empty string
    // The CSS will be injected during runtime
    callback(null, "");
    return;
  }

  // Handle the promise-based CSS entry
  Promise.resolve(css).then(
    (resolvedCss) => {
      callback(null, resolvedCss);
    },
    (error) => {
      callback(error);
    }
  );
};

export default cssLoader;

