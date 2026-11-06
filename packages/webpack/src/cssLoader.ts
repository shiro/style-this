import type { RawLoaderDefinitionFunction } from "webpack";
import { cssFiles } from "./shared";
type Loader = RawLoaderDefinitionFunction;

const cssLoader: Loader = function webpack5LoaderPlugin(code, inputSourceMap) {
  const callback = this.async();

  // TODO remove this when done
  this.cacheable(false);

  const filepath = this.resourcePath;
  // console.log(code);
  // console.log("HIT", filepath, cssFiles);

  const ret = cssFiles.get(`${filepath}.style.css`);
  // console.log("ret is\n", ret);

  if (!ret) {
    callback(null, code, inputSourceMap);
    return;
  }

  // this.addDependency(filepath);

  ret.then(
    (css) => (css instanceof Error ? callback(css) : callback(null, css)),
    (err) => callback(err),
  );

  // console.log(cssFiles)
};

export default cssLoader;
