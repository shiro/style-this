import type { RawLoaderDefinitionFunction } from "webpack";
import { readFile } from "fs/promises";
import { cssFiles } from "../shared";
import { cssExtension, transformFile, type Bundler } from "./transform";

/**
 * Serves the CSS of the file in `?filepath=`. Turbopack runs loaders in a pool of processes, so the
 * CSS may have been evaluated in another process, the file is transformed again if this process has
 * no (or outdated) CSS for it.
 */
const cssLoader: RawLoaderDefinitionFunction<{ bundler?: Bundler }> = function () {
  const callback = this.async();
  // TODO remove this when done
  this.cacheable(false);

  const bundler = this.getOptions().bundler ?? "webpack";
  // the loader rules only match imports with `?filepath=`
  const filepath = new URLSearchParams(this.resourceQuery).get("filepath")!;
  const cssFilepath = `${filepath}.${cssExtension}`;

  (async () => {
    this.addDependency(filepath);
    const code = await readFile(filepath, "utf-8").catch(() => undefined);

    if (code !== undefined && cssFiles.get(cssFilepath)?.code !== code) {
      if (!(await transformFile(this, bundler, code, filepath))) return "";
    }

    const css = await cssFiles.get(cssFilepath);
    if (css instanceof Error) throw css;
    return css ?? "";
  })().then(
    (css) => callback(null, css),
    (err) => callback(err),
  );
};

export default cssLoader;
