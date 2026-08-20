import { Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { resolve as resolvePath } from "path";
import {
  Transformer,
  initializeStyleThis,
  CssCachEntry,
  CssSourceMapData,
} from "@style-this/core/compiler";
import { generateCssSourceMap } from "@style-this/core/cssSourceMap";
import { createRequire } from "node:module";
import { Filter, filterMatches, timeoutPromise, TIMEOUT } from "./util";
import { handleTransformError } from "./util";
import { initializeSolidMocks } from "./solid";
import { isSvelteFile, extractSvelteScript, rewrapSvelteScript } from "./svelte";
import { CacheRegistry } from "./cacheRegistry";

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
export const DefaultImport = Symbol();

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
  filter?: Filter | Filter[];
  ignoredImports?: Record<string, true | (string | typeof DefaultImport)[]>;
  debug?: boolean;
  atomic?: boolean;
  useRequire?: boolean;
  cacheRegistry?: CacheRegistry;
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> { }

export interface ExtraFields {
  cssExtension: string;
  __mocks: Map<string, string>;
  __getTemporaryPrograms: () => Record<string, string>;
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [], debug, atomic = false, useRequire, cacheRegistry = new CacheRegistry() } = options;

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

  // Store source map metadata alongside CSS cache
  const cssSourceMapMetadata = new Map<
    string,
    { sourcemapData: CssSourceMapData; originalSource: string }
  >();

  // Store debug virtual modules
  const debugVirtualModules = new Map<string, string>();

  const onDebugVirtualModule = (name: string, code: string) => {
    debugVirtualModules.set(name, code);
  };

  // Default noop callback for non-debug mode
  const noopCallback = () => { };

  /** Files that contain styled templates, changes cause all importers to reload. */
  const watchedFiles = new Set<string>();
  let resolve: (id: string, importer: string) => Promise<string | undefined>;
  let server: ViteDevServer | undefined;
  let styleThis: Transformer;
  let cwd = process.cwd();
  const mocks = new Map<string, string>();

  let totalTransformTime = 0;

  let atomicCssInvalidationTimer: NodeJS.Timeout | undefined;
  const ATOMIC_CSS_INVALIDATION_DEBOUNCE_MS = 500;

  const scheduleAtomicCssInvalidation = () => {
    if (atomicCssInvalidationTimer) {
      clearTimeout(atomicCssInvalidationTimer);
    }
    atomicCssInvalidationTimer = setTimeout(() => {
      if (server) {
        const atomicCssModuleId = resolvedVirtualModulePrefix + "__style_this_atomic_entrypoint.css";
        const atomicModule = server.moduleGraph.getModuleById(atomicCssModuleId);
        if (atomicModule) {
          server.reloadModule(atomicModule);
        }
      }
      atomicCssInvalidationTimer = undefined;
    }, ATOMIC_CSS_INVALIDATION_DEBOUNCE_MS);
  };

  const createCachePromise = (originalSource: string): CssCachEntry => {
    let resolve: CssCachEntry["resolve"] | undefined;
    const entry = new Promise((_resolve, _reject) => {
      resolve = (
        css: string | Error,
        sourcemapData?: CssSourceMapData,
        filepath?: string,
      ) => {
        // Store source map metadata if provided
        if (
          !(css instanceof Error) &&
          sourcemapData &&
          filepath
        ) {
          cssSourceMapMetadata.set(filepath, {
            sourcemapData,
            originalSource,
          });
        }
        _resolve(css);
      };
    }) as CssCachEntry;
    entry.resolve = resolve!;
    entry.code = originalSource;
    return entry;
  };

  return {
    name: "vite:style-this",
    enforce: "pre",

    cssExtension,
    __mocks: mocks,
    __getDebugVirtualModules: () => Object.fromEntries(debugVirtualModules),

    configureServer(viteServer) {
      server = viteServer;
    },

    async config(config: ViteConfig) {
      config.optimizeDeps = {
        ...(config.optimizeDeps ?? {}),
        include: [
          ...(config.optimizeDeps?.include ?? []),
          "@style-this/core/compiler",
        ],
      };

      await initializeStyleThis();

      cwd = process.cwd();
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

        if (filepath.startsWith(resolvedVirtualModulePrefix)) {
          const virtualPath = filepath.slice(resolvedVirtualModulePrefix.length);
          const entry = cacheRegistry.getCssModule(virtualPath);
          if (entry && entry !== undefined) {
            const content = await entry;
            return [virtualPath, typeof content === 'string' ? content : ''];
          }
          return [virtualPath, ''];
        }

        if (
          !filepath.startsWith(`${cwd}/node_modules/`) &&
          !id.startsWith("@style-this/")
        ) {
          try {
            const raw = await readFile(filepath, "utf-8");
            return [filepath, raw];
          } catch (err) { }
        }

        filepath = require.resolve(id);

        return [filepath, ""];
      };

      styleThis = new Transformer({
        cwd,
        ignoredImports: options.ignoredImports as Record<string, string[]>,
        loadFile,
        cacheRegistry,
        cssExtension,
        useRequire,
        debug,
        atomic,
        onDebugVirtualModule: debug ? onDebugVirtualModule : noopCallback,
      });

      if (atomic) {
        global.__styleThis_getAtomicCss = () => styleThis.get_atomic_css();
      }
    },

    resolveId(id, importer) {
      if (id === '@style-this/core/atomic') {
        const atomicPath = `${virtualModulePrefix}__style_this_atomic_entrypoint.css`;
        return resolvedVirtualModulePrefix + atomicPath.slice(virtualModulePrefix.length);
      }

      if (id.startsWith(virtualModulePrefix)) {
        return resolvedVirtualModulePrefix + id.slice(virtualModulePrefix.length);
      }

      if (importer && importer.startsWith(resolvedVirtualModulePrefix) && importer.endsWith('.style-this.js')) {
        const virtualPath = importer.slice(resolvedVirtualModulePrefix.length);
        const sourceFilePath = virtualPath.slice(0, -'.style-this.js'.length);
        
        if ((id.startsWith('./') || id.startsWith('../')) && sourceFilePath) {
          const path = require('path');
          const resolvedPath = path.resolve(path.dirname(sourceFilePath), id);
          return resolvedPath;
        }
      }
    },

    async load(fullId) {
      if (!fullId.startsWith(resolvedVirtualModulePrefix)) return;

      const [id, _query] = fullId.split("?", 2);
      let filepath = id.slice(resolvedVirtualModulePrefix.length);

      if (filepath === "__style_this_atomic_entrypoint.css") {
        if (atomic) {
          if (!server) {
            return { code: '' };
          }

          for (const sourceFile of watchedFiles) {
            this.addWatchFile(sourceFile);
          }

          const atomicCss = styleThis.get_atomic_css();

          if (typeof atomicCss !== "string") {
            throw new Error(`Unexpected atomic CSS type: ${typeof atomicCss}`);
          }

          return {
            code: atomicCss,
          };
        } else {
          return {
            code: '/* @style-this/core/atomic is a no-op in non-atomic mode */',
          };
        }
      }

      const isAtomicProgram = filepath.endsWith('.style-this.js');

      let cacheKey: string;
      if (filepath.endsWith(`.${cssExtension}`)) {
        const sourceFile = filepath.slice(0, -(cssExtension.length + 1));
        cacheKey = `${sourceFile}.${cssExtension}`;
      } else if (filepath.endsWith('.style-this.js')) {
        const sourceFile = filepath.slice(0, -'.style-this.js'.length);
        cacheKey = `${sourceFile}.style-this.js`;
      } else {
        cacheKey = filepath;
      }

      let entry = isAtomicProgram
        ? cacheRegistry.getAtomicModule(cacheKey)
        : cacheRegistry.getCssModule(cacheKey);

      if ((!entry || entry === undefined) && filepath.startsWith('./')) {
        // Try to find a matching absolute path in the cache
        // For now, we'll skip this optimization as it requires iterating through cache
        // This can be enhanced later with additional registry methods if needed
      }

      if (entry == undefined) {
        throw new Error(
          `failed to load virtual file '${filepath}' from id '${id}'`,
        );
      }

      if (typeof entry == "function")
        throw new Error(
          `virtual CSS file '${filepath}' from id '${id}' not yet ready`,
        );

      let sourceFilepath: string;
      if (filepath.endsWith(`.${cssExtension}`)) {
        sourceFilepath = filepath.slice(0, -(cssExtension.length + 1));
      } else if (filepath.endsWith('.style-this.js')) {
        sourceFilepath = filepath.slice(0, -'.style-this.js'.length);
      } else {
        sourceFilepath = filepath;
      }
      this.addWatchFile(sourceFilepath);

      let time = 0;

      while (true) {
        try {
          const resolved = await timeoutPromise(entry, TIMEOUT_DURATION);

          if (resolved instanceof Error)
            handleTransformError(id, entry.code, resolved);

          // Ensure resolved is a string
          if (typeof resolved !== "string") {
            throw new Error(`Unexpected CSS resolution type: ${typeof resolved}`);
          }

          if (!isAtomicProgram) {
            const metadata = cssSourceMapMetadata.get(filepath);
            if (metadata) {
              const absoluteSourcePath = sourceFilepath.startsWith('/')
                ? sourceFilepath
                : `/${sourceFilepath}`;

              const sourcemap = generateCssSourceMap(
                resolved,
                metadata.sourcemapData,
                absoluteSourcePath,
                metadata.originalSource,
                filepath,
              );

              return {
                code: resolved,
                map: sourcemap,
              };
            }
          }

          return {
            code: resolved,
          };
        } catch (error) {
          if (error == TIMEOUT) {
            time += TIMEOUT_DURATION;
            throw new Error(`CSS entry '${filepath}' did not resolve within ${time / 1000 / 60} minutes (timeout)`);
          } else {
            throw error;
          }
        }
      }
    },

    async generateBundle(_outputOptions, bundle) {
      if (!atomic) return;

      const finalAtomicCss = styleThis.get_atomic_css();

      let cssAsset = null;
      let cssFileName = null;

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset' && fileName.endsWith('.css')) {
          cssAsset = asset;
          cssFileName = fileName;
          break;
        }
      }

      if (cssAsset && cssFileName) {
        const existingCss = typeof cssAsset.source === 'string' ? cssAsset.source : cssAsset.source.toString();
        cssAsset.source = `${existingCss}\n${finalAtomicCss}`;
      } else {
        const atomicCssFileName = 'assets/atomic.css';
        bundle[atomicCssFileName] = {
          type: 'asset',
          fileName: atomicCssFileName,
          source: finalAtomicCss,
        };
      }
    },

    async handleHotUpdate(ctx) {
      if (!watchedFiles.has(ctx.file)) return;

      cacheRegistry.deleteValueCacheEntry(ctx.file);

      const cssFilepath = `${ctx.file}.${cssExtension}`;
      const styleThisFilepath = `${ctx.file}.style-this.js`;

      cacheRegistry.deleteCssModule(cssFilepath);
      cacheRegistry.deleteAtomicModule(styleThisFilepath);
      cssSourceMapMetadata.delete(cssFilepath);

      if (atomic) {
        scheduleAtomicCssInvalidation();
      }

      const sourceModule = ctx.server.moduleGraph.getModuleById(ctx.file);
      if (sourceModule) {
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
        filepath.includes("?") ||
        filepath.endsWith(".css") ||
        filepath.endsWith(".atomic.css") ||
        filepath.endsWith(".style-this.js")
      )
        return;

      if (!filterMatches(filter, filepath)) {
        return;
      }

      let codeToTransform = code;
      let pathForImport = filepath;

      if (isSvelteFile(filepath)) {
        const svelteScript = extractSvelteScript(code, filepath);
        if (!svelteScript) return;
        codeToTransform = svelteScript.codeToTransform;
        pathForImport = svelteScript.normalizedFilepath;
      }

      const cssFilepath = `${pathForImport}.${cssExtension}`;
      const atomicProgramFilepath = `${pathForImport}.style-this.js`;

      const skipCssEval = cacheRegistry.hasCssModule(cssFilepath) && (!atomic || cacheRegistry.hasAtomicModule(atomicProgramFilepath));

      try {
        const startTime = performance.now();

        if (atomic && !cacheRegistry.hasAtomicModule(atomicProgramFilepath)) {
          cacheRegistry.setAtomicModule(atomicProgramFilepath, createCachePromise(code));
        }

        if (!cacheRegistry.hasCssModule(cssFilepath)) {
          cacheRegistry.setCssModule(cssFilepath, createCachePromise(code));
        }

        const transformedResult = await styleThis.transform(
          codeToTransform,
          pathForImport,
          skipCssEval,
        );
        const endTime = performance.now();
        const transformTime = endTime - startTime;
        totalTransformTime += transformTime;

        if (!transformedResult) {
          watchedFiles.delete(filepath);
          return;
        }
        watchedFiles.add(filepath);

        if (server) {
          const virtualModuleId = resolvedVirtualModulePrefix + cssFilepath;
          const module = server.moduleGraph.getModuleById(virtualModuleId);
          if (module && module.importers && module.importers.size > 0) {
            server.reloadModule(module);
          }

          if (atomic) {
            const styleThisModuleId = resolvedVirtualModulePrefix + atomicProgramFilepath;
            const styleThisModule = server.moduleGraph.getModuleById(styleThisModuleId);
            if (styleThisModule && styleThisModule.importers && styleThisModule.importers.size > 0) {
              server.reloadModule(styleThisModule);
            }
          }
        }

        let resultCode = transformedResult.code;
        if (isSvelteFile(filepath)) {
          resultCode = rewrapSvelteScript(code, transformedResult.code);
        }

        return {
          code: resultCode,
          map: transformedResult.sourcemap,
        };
      } catch (err) {
        watchedFiles.add(filepath);
        handleTransformError(filepath, code, err);
      }
    },
  } satisfies Plugin & ExtraFields;
};

export default vitePlugin;
