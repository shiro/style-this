/// <reference path="../global.d.ts" />
import { Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import {
  Transformer,
  initializeStyleThis,
  CssCachEntry,
} from "@style-this/core/compiler";
import { createRequire } from "node:module";
import { Filter, filterMatches } from "./util";
import { handleTransformError } from "./util";

const solidMock = `
export const template = () => () => {};
export const spread = () => {};
export const mergeProps = () => {};
export function use(fn, element, arg) {
  // return untrack(() => fn(element, arg));
}
`;

const TIMEOUT_DURATION = 10000;
const TIMEOUT = Symbol();
export const DefaultImport = Symbol();

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
  filter?: Filter | Filter[];
  ignoredImports?: Record<string, true | (string | typeof DefaultImport)[]>;
  debug?: boolean;
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> {}

export interface ExtraFields {
  cssExtension: string;
  __mocks: Map<string, string>;
  __getTemporaryPrograms: () => Record<string, string>;
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [], debug } = options;

  if (!Array.isArray(filter)) filter = [filter];

  if (options.ignoredImports) {
    for (const [key, value] of Object.entries(options.ignoredImports)) {
      if (value === true) {
        options.ignoredImports[key] = [];
        continue;
      }
      if (Array.isArray(value)) {
        if (value.length == 0) {
          delete options.ignoredImports[key];
          continue;
        }
        options.ignoredImports[key] = value.map((item) =>
          item === DefaultImport ? "__global__export__" : item,
        );
      }
    }
  }

  const virtualModulePrefix = "virtual:style-this:";
  const resolvedVirtualModulePrefix = "\0" + virtualModulePrefix;

  if (!global.__styleThis_cssCache) {
    global.__styleThis_cssCache = new Map<string, CssCachEntry>();
  }
  const cssCache = global.__styleThis_cssCache;

  if (!global.__styleThis_valueCache) {
    global.__styleThis_valueCache = {};
  }
  const valueCache = global.__styleThis_valueCache;

  if (debug && !global.__styleThis_temporaryPrograms) {
    global.__styleThis_temporaryPrograms = {};
  }

  const filesContainingStyledTemplates = new Set<string>();
  let resolve: (id: string, importer: string) => Promise<string | undefined>;
  let server: ViteDevServer | undefined;
  let styleThis: Transformer;
  const mocks = new Map<string, string>();

  // Timing variables
  let totalTransformTime = 0;

  mocks.set("solid-js/web", solidMock);

  return {
    name: "vite:style-this",
    enforce: "pre",

    cssExtension,
    __mocks: mocks,
    __getTemporaryPrograms: () => ({ ...global.__styleThis_temporaryPrograms }),

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
        id: string,
        importer: string,
      ): Promise<[string, string]> => {
        if (mocks.has(id)) {
          const filepath = require.resolve(id);
          return [filepath, mocks.get(id)!];
        }

        let filepathWithQuery = await resolve(id, importer);

        if (filepathWithQuery == undefined)
          throw new Error(`vite failed to resolve import '${id}'`);

        let [filepath, _query] = filepathWithQuery.split("?", 2);

        if (
          !filepath.startsWith(`${cwd}/node_modules/`) &&
          !id.startsWith("@style-this/")
        ) {
          try {
            const raw = await readFile(filepath, "utf-8");
            return [filepath, raw];
          } catch (err) {}
        }

        // for anything inside node_modules, use Node's dependency resolution instead, as vite might give us the
        // bundled one (that might not yet exist on disk)
        // also do not load the contents, the transformer should require(...) it as-is
        filepath = require.resolve(id);

        return [filepath, ""];
      };

      styleThis = new Transformer({
        cwd,
        ignoredImports: options.ignoredImports as Record<string, string[]>,

        loadFile,
        cssCache,
        valueCache,

        cssExtension,

        useRequire: (options as any).useRequire,
        debug,
      });
    },

    resolveId(id) {
      if (id.startsWith(virtualModulePrefix)) {
        return (
          resolvedVirtualModulePrefix + id.slice(virtualModulePrefix.length)
        );
      }
    },

    async load(fullId) {
      if (fullId.startsWith(resolvedVirtualModulePrefix)) {
        const [id, _query] = fullId.split("?", 2);
        const filepath = id.slice(resolvedVirtualModulePrefix.length);

        const entry = cssCache.get(filepath);

        if (entry == undefined)
          throw new Error(
            `failed to load virtual CSS file '${filepath}' from id '${id}'`,
          );

        if (typeof entry == "function")
          throw new Error(
            `virtual CSS file '${filepath}' from id '${id}' not yet ready`,
          );

        // tell Vite that this virtual CSS module depends on the source file
        // remove the css extension to get the original source file path
        const sourceFilepath = filepath.endsWith(cssExtension)
          ? filepath.slice(0, -cssExtension.length)
          : filepath;
        this.addWatchFile(sourceFilepath);

        let time = 0;

        while (true) {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(TIMEOUT), TIMEOUT_DURATION);
          });

          try {
            const resolved = (await Promise.race([
              entry,
              timeoutPromise,
            ])) as string;
            return resolved;
          } catch (error) {
            if (error == TIMEOUT) {
              time += TIMEOUT_DURATION;
              console.warn(
                `CSS entry '${filepath}' loading for over ${time}sec, might be a deadlock`,
              );
            } else {
              throw error;
            }
          }
        }
      }
    },

    async handleHotUpdate(ctx) {
      if (!filesContainingStyledTemplates.has(ctx.file)) return;

      // remove from cache
      valueCache[ctx.file] = {};
      const cssFilepath = `${ctx.file}.${cssExtension}`;
      cssCache.delete(cssFilepath);

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
      const skipCssEval = cssCache.has(cssFilepath);

      try {
        const startTime = performance.now();

        if (!skipCssEval) {
          let resolve: CssCachEntry["resolve"] | undefined;
          let reject: CssCachEntry["reject"] | undefined;
          const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
          }) as CssCachEntry;
          promise.resolve = resolve!;
          promise.reject = reject!;

          cssCache.set(cssFilepath, promise);
        }

        const transformedResult = await styleThis.transform(
          code,
          filepath,
          skipCssEval,
          importSource,
        );
        const endTime = performance.now();
        const transformTime = endTime - startTime;
        totalTransformTime += transformTime;

        // console.log(
        //   `Transform took ${transformTime.toFixed(2)}ms for ${filepath} (total: ${totalTransformTime.toFixed(2)}ms)`,
        // );

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
