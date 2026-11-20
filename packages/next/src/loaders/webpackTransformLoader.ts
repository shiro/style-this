import type { RawLoaderDefinitionFunction } from "webpack";
import { transformFile } from "./transform";

const webpackTransformLoader: RawLoaderDefinitionFunction<{}> = function (code, inputSourceMap) {
  const callback = this.async();

  // TODO remove this when done
  this.cacheable(false);

  transformFile(this, "webpack", code.toString(), this.resourcePath).then(
    // TODO sourcemap
    (result) => (result ? callback(null, result.code) : callback(null, code, inputSourceMap)),
    (err) => callback(err),
  );
};

export default webpackTransformLoader;
