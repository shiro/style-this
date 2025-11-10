import { Plugin, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import * as StyleThis from "@style-this/core/compiler";

import { createRequire } from "node:module";

type Filter = RegExp | ((filepath: string) => boolean);

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
  filter?: Filter | Filter[];
}

interface ViteConfig {
  // router?: string;
}

interface ExtraFields {
  cssExtension: string;
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [] } = options;

  if (!Array.isArray(filter)) filter = [filter];

  const virtualModulePrefix = "virtual:style-this:";
  const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

  const cssFiles = new Map<string, string>();
  let resolve: (id: string) => Promise<string | undefined>;
  let server: ViteDevServer | undefined;
  let styleThis: StyleThis.Transformer;

  return {
    name: "vite:style-this",

    cssExtension,

    configureServer(viteServer) {
      server = viteServer;
    },

    async config(config: ViteConfig) {
      (global as any).__styleThisClearCache = (
        cacheId: string,
        filepath: string,
      ) => {
        const cache = (global as any)[cacheId]?.[filepath] as
          | Record<string, any>
          | undefined;

        if (!cache) return;

        const filtered = Object.fromEntries(
          Object.entries(cache).filter(([k]) => !k.startsWith("__css")),
        );
        (global as any)[cacheId][filepath] = filtered;
      };

      await StyleThis.initializeStyleThisCompiler();

      const cwd = process.cwd();
      const require = createRequire(cwd + "/package.json");

      const loadFile = async (importSourceId: string) => {
        let filepathWithQuery = await resolve(importSourceId);

        if (!filepathWithQuery)
          throw new Error(`vite failed to resolve import '${importSourceId}'`);

        let [filepath, _query] = filepathWithQuery.split("?", 2);

        // for anything inside node_modules, use Node's dependency resolution instead, as vite might give us the
        // bundled one (that might not yet exist on disk)
        // also do not load the contents, the transformer should require(...) it as-is
        if (filepath.startsWith(`${cwd}/node_modules/`)) {
          filepath = require.resolve(importSourceId);
          return [filepath, ""];
        }

        const raw = await readFile(filepath, "utf-8");

        return [filepath, raw];
      };

      styleThis = StyleThis.initialize({
        loadFile,
        cssFileStore: cssFiles,

        cssExtension,
      });
    },

    resolveId(id) {
      if (id.startsWith(virtualModulePrefix)) {
        return (
          resolvedVirtualModulePrefix + id.slice(virtualModulePrefix.length)
        );
      }
    },

    load(fullId) {
      if (fullId.startsWith(resolvedVirtualModulePrefix)) {
        const [id, _query] = fullId.split("?", 2);
        const filepath = id.slice(resolvedVirtualModulePrefix.length);
        const raw = cssFiles.get(filepath);
        if (raw == undefined)
          throw new Error(
            `failed to load virtual CSS file '${filepath}' from id '${id}'`,
          );

        // Tell Vite that this virtual CSS module depends on the source file
        // Remove the css extension to get the original source file path
        const sourceFilepath = filepath.endsWith(cssExtension)
          ? filepath.slice(0, -cssExtension.length)
          : filepath;
        this.addWatchFile(sourceFilepath);

        return raw;
      }
    },

    async transform(code, filepath) {
      if (!resolve) {
        resolve = async (id?: string) => {
          if (!id) return;
          return (await this.resolve(id))?.id;
        };
      }

      if (
        !filepath ||
        filepath.includes("/node_modules/") ||
        (!filepath.endsWith(".ts") &&
          !filepath.endsWith(".tsx") &&
          !filepath.endsWith(".js") &&
          !filepath.endsWith(".jsx"))
      )
        return;

      if (
        filter.length != 0 &&
        !filter.some((filter) =>
          filter instanceof RegExp ? filter.test(filepath) : filter(filepath),
        )
      ) {
        return;
      }

      const cssFilepath = `${filepath}.${cssExtension}`;
      cssFiles.delete(cssFilepath);

      try {
        const transformedResult = await styleThis.transform(code, filepath);

        if (!transformedResult) return;

        // during dev, invalidate the virtual CSS module
        if (server) {
          const virtualModuleId = resolvedVirtualModulePrefix + cssFilepath;
          const module = server.moduleGraph.getModuleById(virtualModuleId);
          if (module) server.reloadModule(module);
        }

        console.log(transformedResult.sourcemap);

        return {
          code: transformedResult.code,
          map: transformedResult.sourcemap,
        };
      } catch (err) {
        if (!(err instanceof Error)) throw err;

        // vite doesn't print cause, add it to the message
        if (err.cause) err.message += `\nCause:\n${err.cause}`;

        throw err;
      }
    },
  } satisfies Plugin & ExtraFields;
};

export default vitePlugin;
