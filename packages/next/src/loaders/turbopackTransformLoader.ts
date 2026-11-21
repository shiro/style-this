import type { RawLoaderDefinitionFunction } from "webpack";
import { transformFile } from "./transform";

const turbopackTransformLoader: RawLoaderDefinitionFunction<{}> = function (code, inputSourceMap) {
  const callback = this.async();

  transformFile(this, "turbopack", code.toString(), this.resourcePath).then(
    // TODO sourcemap
    (result) => (result ? callback(null, result.code) : callback(null, code, inputSourceMap)),
    (err) => callback(err),
  );
};

export default turbopackTransformLoader;
