import type { RawLoaderDefinitionFunction } from "webpack";
import { cssFiles } from "./shared";
type Loader = RawLoaderDefinitionFunction;

const cssLoader: Loader = function webpack5LoaderPlugin(code, inputSourceMap) {
  this.async();

  // TODO remove this when done
  this.cacheable(false);

  const filepath = this.resourcePath;
  // console.log(code);
  console.log("HIT", filepath, cssFiles);

  const ret = cssFiles.get(`${filepath}.css`);
  console.log(ret);

  if (!ret) {
    this.callback(null, code, inputSourceMap);
    return;
  }

  // this.addDependency(filepath);

  // return ret;
  this.callback(null, ret);

  // console.log(cssFiles)
};

export default cssLoader;
