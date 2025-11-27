import type { RawLoaderDefinitionFunction } from "webpack";
import { cssFiles, dependencyStore } from "../shared";
type Loader = RawLoaderDefinitionFunction;

const cssLoader: Loader = function webpack5LoaderPlugin(code, inputSourceMap) {
  // this.async();
  // TODO remove this when done
  this.cacheable(false);

  let filepath = this.resourcePath;

  if (this.resourceQuery.startsWith("?filepath=")) {
    filepath = this.resourceQuery.slice("?filepath=".length).split("&")[0];
  }

  const css = cssFiles.get(`${filepath}.css`);

  // this.clearDependencies();
  // this.addDependency(filepath);

  // console.log("CSS", filepath, this.getDependencies());

  if (!css) {
    console.log(cssFiles);
    throw new Error(`failed to load virtual CSS file '${filepath}'`);
  }

  return css;
};

export default cssLoader;
