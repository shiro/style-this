import { Plugin, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { Transformer } from "@style-this/core/compiler";
import * as StyleThis from "@style-this/core/compiler";

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
}

interface ViteConfig {
  // router?: string;
}

interface ExtraFields {
  cssExtension: string;
}

const vitePlugin = (options: Options = {}) => {
  const { cssExtension = "css" } = options;

  const virtualModulePrefix = "virtual:style-this:";
  const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

  const cssFiles = new Map<string, string>();
  let resolve: (id: string) => Promise<string | undefined>;
  let router: string;
  let server: ViteDevServer | undefined;
  let styleThis: Transformer;

  return {
    name: "vite:style-this",

    cssExtension,

    configureServer(viteServer) {
      server = viteServer;
    },

    async config(config: ViteConfig) {
      // TODO move out solid start
      router = (config as any).router?.name;

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

      const loadFile = async (importSourceId: string) => {
        let filepathWithQuery = await resolve(importSourceId);

        if (!filepathWithQuery)
          throw new Error(`vite failed to resolve import '${importSourceId}'`);

        console.log("resolve", importSourceId, filepathWithQuery);

        const [filepath, _query] = filepathWithQuery.split("?", 2);

        if (filepath.startsWith(`${cwd}/node_modules/`)) {
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

      if (router && router != "client") return;

      if (
        !filepath ||
        filepath.includes("node_modules") ||
        (!filepath.endsWith(".tsx") && !filepath.endsWith(".jsx"))
      )
        return;

      const cssFilepath = `${filepath}.${cssExtension}`;
      cssFiles.delete(cssFilepath);

      const transformedCode = await styleThis.transform(code, filepath);

      // during dev, invalidate the virtual CSS module
      if (server) {
        const virtualModuleId = resolvedVirtualModulePrefix + cssFilepath;
        const module = server.moduleGraph.getModuleById(virtualModuleId);
        if (module) server.reloadModule(module);
      }

      return transformedCode;
    },
  } satisfies Plugin & ExtraFields;
};

export default vitePlugin;
