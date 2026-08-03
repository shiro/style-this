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

  console.log("CSS Loader - filepath:", filepath, "has CSS:", !!css, "cssFiles keys:", Array.from(cssFiles.keys()));

  if (!css) {
    console.log(cssFiles);
    callback(new Error(`failed to load virtual CSS file '${filepath}'`));
    return;
  }

  // Handle the promise-based CSS entry
  Promise.resolve(css).then(
    (resolvedCss) => {
      console.log("CSS Loader - resolved CSS:", resolvedCss?.substring?.(0, 100));
      callback(null, resolvedCss);
    },
    (error) => {
      console.log("CSS Loader - error:", error);
      callback(error);
    }
  );
};

export default cssLoader;

