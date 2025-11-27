import path from "path";
import { initializeStyleThis } from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { cssFiles, dependencyStore } from "../shared";
import { Transformer } from "@style-this/core/compiler";
import type { RawLoaderDefinitionFunction } from "webpack";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

type LoaderType = RawLoaderDefinitionFunction<{}>;

let styleThis: Transformer;
const exportCache = {} as Record<string, Record<string, any>>;
const filesContainingStyledTemplates = new Set<string>();
const cssExtension = "css";
const mocks = new Map<string, string>();

const turbopackTransformLoader: LoaderType = function (code, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  const resolveSync = this.getResolve({ dependencyType: "esm" });

  const resolve = (
    token: string,
    importer: string,
  ): Promise<string | undefined> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((ok) => {
      resolveSync(context, token, (err, result) => {
        if (err) {
          ok(undefined);
        } else if (result) {
          this.addDependency(result);
          ok(result);
        } else {
          ok(undefined);
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

    let filepath =
      (await resolve(importSourceId, "./index.ts")) ?? importSourceId;

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
        wrapSelectorsWithGlobal: true,
      });
    }

    const filepath = this.resourcePath;
    const qualifier = filepath.endsWith("pages/_app.tsx") ? "global" : "module";
    const noopFilepath = path.resolve(
      __dirname,
      `../../style-this.${qualifier}.css`,
    );
    const noopFilepathRelative = path.relative(
      path.dirname(filepath),
      noopFilepath,
    );

    // we explicitly cache-bust here
    const importSource = `${noopFilepathRelative}?filepath=${filepath}&time=${+new Date()}`;

    const transformedResult = await styleThis.transform(
      code.toString(),
      filepath,
      importSource,
    );

    if (!transformedResult) {
      filesContainingStyledTemplates.delete(filepath);
      dependencyStore.delete(filepath);
      this.callback(null, code, inputSourceMap);
      return;
    }

    filesContainingStyledTemplates.add(filepath);
    dependencyStore.set(filepath, this.getDependencies());

    this.addDependency(noopFilepath);

    this.callback(
      null,
      transformedResult.code,
      // TODO sourcemap
    );

    // console.log("JS", filepath, this.getDependencies());
  })();
};

export default turbopackTransformLoader;
