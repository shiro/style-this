import type { RawLoaderDefinitionFunction } from "webpack";
import { transformFile } from "./transform";
import { chainSourceMap } from "./shared";

const turbopackTransformLoader: RawLoaderDefinitionFunction<{}> = function (code, inputSourceMap) {
  const callback = this.async();

  transformFile(this, "turbopack", code.toString(), this.resourcePath).then(
    (result) =>
      result
        ? callback(null, result.code, chainSourceMap(result.sourcemap, inputSourceMap))
        : callback(null, code, inputSourceMap),
    (err) => callback(err),
  );
};

export default turbopackTransformLoader;
