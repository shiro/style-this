import type { RawLoaderDefinitionFunction } from "webpack";
import { dependencyStore } from "../shared";
import { transformFile } from "./transform";

const turbopackTransformLoader: RawLoaderDefinitionFunction<{}> = function (code, inputSourceMap) {
  const callback = this.async();
  const filepath = this.resourcePath;

  transformFile(this, "turbopack", code.toString(), filepath).then(
    (result) => {
      if (!result) {
        dependencyStore.delete(filepath);
        callback(null, code, inputSourceMap);
        return;
      }
      dependencyStore.set(filepath, this.getDependencies());
      // TODO sourcemap
      callback(null, result.code);
    },
    (err) => callback(err),
  );
};

export default turbopackTransformLoader;
