import { Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { Transformer, initializeStyleThis } from "@style-this/core/compiler";
import { createRequire } from "node:module";
import { Filter, filterMatches } from "./util";
import { handleTransformError } from "./util";

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
  filter?: Filter | Filter[];
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> {}

export interface ExtraFields {
  cssExtension: string;
  __mocks: Map<string, string>;
  __getTemporaryPrograms: () => string[];
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [] } = options;

  if (!Array.isArray(filter)) filter = [filter];

  const virtualModulePrefix = "virtual:style-this:";
  const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

  const cssFiles = new Map<string, string>();
  const exportCache = {} as Record<string, Record<string, any>>;
  const filesContainingStyledTemplates = new Set<string>();
  let resolve: (id: string, importer: string) => Promise<string | undefined>;
  let server: ViteDevServer | undefined;
  let styleThis: Transformer;
  const mocks = new Map<string, string>();
  const temporaryPrograms: string[] = [];

  return {
    name: "vite:style-this",
    enforce: "pre",

    cssExtension,
    __mocks: mocks,
    __getTemporaryPrograms: () =>
      temporaryPrograms.splice(0, temporaryPrograms.length),

    configureServer(viteServer) {
      server = viteServer;
    },

    async config(config: ViteConfig) {
      // this is a CJS library, need to bundle it
      config.optimizeDeps = {
        ...(config.optimizeDeps ?? {}),
        include: [
          ...(config.optimizeDeps?.include ?? []),
          "@style-this/core/compiler",
        ],
      };

      await initializeStyleThis();

      const cwd = process.cwd();
      const require = createRequire(cwd + "/package.json");

      const loadFile = async (
        importId: string,
        importerId: string,
      ): Promise<[string, string]> => {
        if (mocks.has(importId)) {
          const filepath = require.resolve(importId);
          return [filepath, mocks.get(importId)!];
        }

        let filepathWithQuery = await resolve(importId, importerId);

        if (filepathWithQuery == undefined)
          throw new Error(`vite failed to resolve import '${importId}'`);

        let [filepath, _query] = filepathWithQuery.split("?", 2);

        if (
          !filepath.startsWith(`${cwd}/node_modules/`) &&
          !importId.startsWith("@style-this/")
        ) {
          try {
            const raw = await readFile(filepath, "utf-8");
            return [filepath, raw];
          } catch (err) {}
        }

        // for anything inside node_modules, use Node's dependency resolution instead, as vite might give us the
        // bundled one (that might not yet exist on disk)
        // also do not load the contents, the transformer should require(...) it as-is
        filepath = require.resolve(importId);
        return [filepath, ""];
      };

      styleThis = new Transformer({
        loadFile,
        cssFileStore: cssFiles,
        exportCache,

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

        // tell Vite that this virtual CSS module depends on the source file
        // remove the css extension to get the original source file path
        const sourceFilepath = filepath.endsWith(cssExtension)
          ? filepath.slice(0, -cssExtension.length)
          : filepath;
        this.addWatchFile(sourceFilepath);

        return raw;
      }
    },

    async handleHotUpdate(ctx) {
      if (!filesContainingStyledTemplates.has(ctx.file)) return;

      // reset cache
      exportCache[ctx.file] = {};

      // invalidate all modules that import this one
      const sourceModule = ctx.server.moduleGraph.getModuleById(ctx.file);
      if (sourceModule) {
        // TODO get the files who evaluted this one from rust only
        for (const importer of sourceModule.importers) {
          ctx.server.reloadModule(importer);
        }
      }
    },

    async transform(code, filepath) {
      if (!resolve) {
        resolve = async (id: string, importer: string) => {
          if (!id) return;
          return (await this.resolve(id, importer))?.id;
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

      if (!filterMatches(filter, filepath)) {
        return;
      }

      const importSource = `${virtualModulePrefix}${filepath}.${cssExtension}`;
      const cssFilepath = `${filepath}.${cssExtension}`;
      cssFiles.delete(cssFilepath);

      try {
        const transformedResult = await styleThis.transform(
          code,
          filepath,
          importSource,
        );

        if (!transformedResult) {
          filesContainingStyledTemplates.delete(filepath);
          return;
        }
        filesContainingStyledTemplates.add(filepath);

        // during dev, invalidate the virtual CSS module
        if (server) {
          const virtualModuleId = resolvedVirtualModulePrefix + cssFilepath;
          const module = server.moduleGraph.getModuleById(virtualModuleId);
          if (module) server.reloadModule(module);
        }

        temporaryPrograms.push(...transformedResult.temporaryPrograms);

        return {
          code: transformedResult.code,
          map: transformedResult.sourcemap,
        };
      } catch (err) {
        handleTransformError(err);
      }
    },
  } satisfies Plugin & ExtraFields;
};

export default vitePlugin;
