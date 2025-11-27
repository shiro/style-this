import path from "path";
import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis } from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { cssFiles } from "../shared";
import { Transformer } from "@style-this/core/compiler";

type LoaderType = RawLoaderDefinitionFunction<{}>;

// const cache = new TransformCacheCollection();

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "css";
const mocks = new Map<string, string>();

const webpackTransformLoader: LoaderType = function (code, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  // TODO remove this when done
  this.cacheable(false);

  const resolveSync = this.getResolve({ dependencyType: "esm" });

  const resolve = (token: string, importer: string): Promise<string> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((resolvePromise, rejectPromise) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          rejectPromise(err);
        } else if (result) {
          this.addDependency(result);
          resolvePromise(result);
        } else {
          rejectPromise(new Error(`Cannot resolve ${token}`));
        }
      });
    });
  };

  const cwd = process.cwd();

  const loadFile = async (
    importSourceId: string,
  ): Promise<[string, string]> => {
    if (mocks.has(importSourceId)) {
      const filepath = require.resolve(importSourceId);
      return [filepath, mocks.get(importSourceId)!];
    }

    let filepathWithQuery = await resolve(importSourceId, "./index.ts");

    if (!filepathWithQuery)
      throw new Error(`webpack failed to resolve import '${importSourceId}'`);

    let [filepath, _query] = filepathWithQuery.split("?", 2);

    if (
      !filepath.startsWith(`${cwd}/node_modules/`) &&
      !importSourceId.startsWith("@style-this/")
    ) {
      try {
        const raw = await readFile(filepath, "utf-8");
        return [filepath, raw];
      } catch (err) {}
    }

    // for anything inside node_modules, use Node's dependency resolution instead, as vite might give us the
    // bundled one (that might not yet exist on disk)
    // also do not load the contents, the transformer should require(...) it as-is
    filepath = require.resolve(importSourceId);
    return [filepath, ""];
  };

  (async () => {
    if (!styleThis) {
      await initializeStyleThis();
      styleThis = new Transformer({
        loadFile,
        cssFileStore: cssFiles,
        exportCache,
        cssExtension,
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    const cssFilepath = `${filepath}.${qualifier}.${cssExtension}`;

    console.log("JS", filepath, this.getDependencies());

    const importSourceRequest = `${cssFilepath}!=!${filepath}?${cssFilepath}`;
    const importSource = this.utils.contextify(
      this.context || this.rootContext,
      importSourceRequest,
    );

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      importSource,
    );

    if (!transformedResult) {
      filesContainingStyledTemplates.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }
    filesContainingStyledTemplates.add(filepath);

    this.callback(
      null,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default webpackTransformLoader;
