import { LoaderContext } from "webpack";
import { StyleThisWebpackPlugin } from "./index";

interface LoaderOptions {
  plugin: StyleThisWebpackPlugin;
}

export default async function styleThisLoader(
  this: LoaderContext<LoaderOptions>,
  source: string,
) {
  const callback = this.async();
  const options = this.getOptions();

  if (!options.plugin) {
    return callback(new Error("StyleThisWebpackPlugin instance is required"));
  }

  try {
    const result = await options.plugin.transform(source, this.resourcePath);

    if (!result) {
      return callback(null, source);
    }

    callback(null, result.code, result.map);
  } catch (err) {
    callback(err as Error);
  }
}
