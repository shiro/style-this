import type { RawLoaderDefinitionFunction } from "webpack";
import { Transformer, initializeStyleThis } from "@style-this/core/compiler";
import { cssFiles } from "./shared";
import path from "path";
import { readFile } from "fs/promises";

export type LoaderOptions = {
  extension?: string;
  prefixer?: boolean;
  sourceMap?: boolean;
};
type Loader = RawLoaderDefinitionFunction<LoaderOptions>;

// const cache = new TransformCacheCollection();

const cssLoader = require.resolve("./cssLoader.mjs");

export const NextCSSLoader = cssLoader;

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "style.css";
const mocks = new Map<string, string>();

const webpack5Loader: Loader = function webpack5LoaderPlugin(
  code,
  inputSourceMap,
) {
  // tell Webpack this loader is async
  this.async();

  // TODO remove this when done
  this.cacheable(false);

  // const outputFileName = this.resourcePath.replace(/\.[^.]+$/, extension);
  const resolveSync = this.getResolve({ dependencyType: "esm" });

  const resolve = (
    token: string,
    importer: string,
  ): Promise<string | undefined> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((resolvePromise) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          resolvePromise(undefined);
        } else if (result) {
          this.addDependency(result);
          resolvePromise(result);
        } else {
          resolvePromise(undefined);
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
    const cssFilepath = `${filepath}.${cssExtension}`;

    // console.log("LOAD style-this", this.resourcePath);
    // console.log(code);

    // const request = `${cssFilepath}!=!${cssLoader}!${filepath}`;
    const importSourceRequest = `${cssFilepath}!=!${cssLoader}!${filepath}`;

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

    // console.log(transformedResult.code);

    this.callback(
      null,
      // `import ${stringifiedRequest};\n${transformedResult.code}`,
      transformedResult.code,
      // TODO sourcemap
    );
  })();
};

export default webpack5Loader;
