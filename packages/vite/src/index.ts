import { Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { resolve as resolvePath } from "path";
import {
  Transformer,
  initializeStyleThis,
  CssCachEntry,
  CssSourceMapData,
  CacheRegistry,
} from "@style-this/core/compiler";
import { generateCssSourceMap } from "@style-this/core/cssSourceMap";
import { createRequire } from "node:module";
import { Filter, filterMatches, timeoutPromise, TIMEOUT } from "./util";
import { handleTransformError } from "./util";
import { initializeSolidMocks } from "./solid";
import { isSvelteFile, extractSvelteScript, rewrapSvelteScript } from "./svelte";

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
  let { cssExtension = "css", filter = [], debug, atomic = false, useRequire, cacheRegistry } = options;

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

  // Create new caches if no registry provided
  let cssCache: Map<string, CssCachEntry>;
  let atomicCache: Map<string, CssCachEntry>;
  let valueCache: Map<string, Record<string, unknown>>;

  if (cacheRegistry) {
    // If a cache registry is provided, we still need to get the actual cache objects
    // from global since the registry only holds refs to them
    cssCache = (global as unknown as Record<string, unknown>)[cacheRegistry.css_cache_ref()] as Map<string, CssCachEntry>;
    atomicCache = (global as unknown as Record<string, unknown>)[cacheRegistry.atomic_cache_ref()] as Map<string, CssCachEntry>;
    valueCache = (global as unknown as Record<string, unknown>)[cacheRegistry.value_cache_ref()] as Map<string, Record<string, unknown>>;
  } else {
    // Create fresh local caches for this plugin instance
    cssCache = new Map<string, CssCachEntry>();
    atomicCache = new Map<string, CssCachEntry>();
    valueCache = new Map<string, Record<string, unknown>>();
  }

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
  const mocks = new Map<string, string>();

  // Timing variables
  let totalTransformTime = 0;

  // Atomic CSS invalidation debouncing
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

        // For virtual modules, load from cache
        if (filepath.startsWith(resolvedVirtualModulePrefix)) {
          const virtualPath = filepath.slice(resolvedVirtualModulePrefix.length);
          const entry = cssCache.get(virtualPath);
          if (entry) {
            // Wait for the entry to resolve
            const content = await entry;
            return [virtualPath, typeof content === 'string' ? content : ''];
          }
          // If not in cache, return empty
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
        atomicCache,
        valueCache,
        cacheRegistry,

        cssExtension,

        useRequire,
        debug,
        atomic,
        onDebugVirtualModule: debug ? onDebugVirtualModule : noopCallback,
      });

      // In atomic mode, set up global helper function using the Transformer instance
      if (atomic) {
        global.__styleThis_getAtomicCss = () => styleThis.get_atomic_css();
      }
    },

    resolveId(id, _importer) {
      // Handle @style-this/core/atomic imports
      if (id === '@style-this/core/atomic') {
        const atomicPath = `${virtualModulePrefix}__style_this_atomic_entrypoint.css`;
        return resolvedVirtualModulePrefix + atomicPath.slice(virtualModulePrefix.length);
      }

      if (id.startsWith(virtualModulePrefix)) {
        const resolved = resolvedVirtualModulePrefix + id.slice(virtualModulePrefix.length);

        // Mark .style-this.js modules as external to prevent Vite's import analyzer from trying to resolve imports
        // within the generated atomic program code, which would cause "Failed to resolve import" errors
        if (id.endsWith('.style-this.js')) {
          return { id: resolved, external: true };
        }

        return resolved;
      }
    },

    async load(fullId) {
      if (!fullId.startsWith(resolvedVirtualModulePrefix)) return;

      const [id, _query] = fullId.split("?", 2);
      let filepath = id.slice(resolvedVirtualModulePrefix.length);

      // Check if this is the atomic entrypoint file (always available)
      if (filepath === "__style_this_atomic_entrypoint.css") {
        if (atomic) {
          if (!server) {
            // In production builds, return empty—the actual atomic CSS will be injected via generateBundle hook
            return { code: '' };
          }

          // Dev mode: Make this module depend on all source files that have been watched
          // This ensures that if any of them change/transform, this module gets re-evaluated
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

      // Check if this is an atomic program (.style-this.js)
      const isAtomicProgram = filepath.endsWith('.style-this.js');
      const cache = isAtomicProgram ? atomicCache : cssCache;

      // Try to find the entry in the cache
      // If the filepath is relative (e.g., "./MainComponent.tsx.style-this.js"),
      // search through cache keys to find a match
      let entry = cache.get(filepath);

      if (!entry && filepath.startsWith('./')) {
        // Try to find a matching absolute path in the cache
        const relativeName = filepath.substring(2); // Remove "./"

        for (const [cachedPath, cachedEntry] of cache.entries()) {
          if (cachedPath.endsWith(relativeName) || cachedPath.endsWith('/' + relativeName)) {
            entry = cachedEntry;
            filepath = cachedPath; // Update filepath to the absolute path
            break;
          }
        }
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

      // tell Vite that this virtual module depends on the source file
      // remove the extension to get the original source file path
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

          // Generate source map if we have metadata (not for atomic programs)
          if (!isAtomicProgram) {
            const metadata = cssSourceMapMetadata.get(filepath);
            if (metadata) {
              // Ensure source filepath is absolute for proper browser resolution
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

          // Return without source map if no metadata
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
      // In atomic mode, after all files have been transformed, inject the final atomic CSS into the bundle
      if (!atomic) return;

      const finalAtomicCss = styleThis.get_atomic_css();

      // Find or create the main CSS asset in the bundle
      let cssAsset = null;
      let cssFileName = null;

      // Look for existing CSS assets
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset' && fileName.endsWith('.css')) {
          cssAsset = asset;
          cssFileName = fileName;
          break;
        }
      }

      if (cssAsset && cssFileName) {
        // Append the atomic CSS to the existing CSS file
        const existingCss = typeof cssAsset.source === 'string' ? cssAsset.source : cssAsset.source.toString();
        cssAsset.source = `${existingCss}\n${finalAtomicCss}`;
      } else {
        // Create a new CSS asset with the atomic CSS if no CSS file exists
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

      // remove from value cache
      if (valueCache instanceof Map) {
        valueCache.delete(ctx.file);
      } else {
        valueCache[ctx.file] = {};
      }

      const cssFilepath = `${ctx.file}.${cssExtension}`;
      const styleThisFilepath = `${ctx.file}.style-this.js`;

      cssCache.delete(cssFilepath);
      atomicCache.delete(styleThisFilepath);
      cssSourceMapMetadata.delete(cssFilepath);

      // Atomic CSS cache doesn't need clearing on hot update — rules are re-accumulated
      // deterministically when files re-transform, and other files' rules should be preserved.

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
        filepath.includes("?") ||
        filepath.endsWith(".css") ||
        filepath.endsWith(".atomic.css") ||
        filepath.endsWith(".style-this.js")
      )
        return;

      if (!filterMatches(filter, filepath)) {
        return;
      }

      // Handle Svelte files: extract script block and normalize filepath
      let codeToTransform = code;
      let pathForImport = filepath;

      if (isSvelteFile(filepath)) {
        const svelteScript = extractSvelteScript(code, filepath);
        if (!svelteScript) return; // Svelte file with no script block
        codeToTransform = svelteScript.codeToTransform;
        pathForImport = svelteScript.normalizedFilepath;
      }

      const cssFilepath = `${pathForImport}.${cssExtension}`;

      const atomicProgramFilepath = `${pathForImport}.style-this.js`;

      // In atomic mode, we should not skip CSS eval if the atomic cache entry hasn't been resolved yet
      // In non-atomic mode, we can skip if the CSS cache entry exists
      const skipCssEval = cssCache.has(cssFilepath) && (!atomic || atomicCache.has(atomicProgramFilepath));

      try {
        const startTime = performance.now();

        if (atomic && !atomicCache.has(atomicProgramFilepath)) {
          atomicCache.set(atomicProgramFilepath, createCachePromise(code));
        }

        if (!cssCache.has(cssFilepath)) {
          // Create cache entry for CSS file
          cssCache.set(cssFilepath, createCachePromise(code));
        }

        const transformedResult = await styleThis.transform(
          codeToTransform,
          pathForImport,
          skipCssEval,
        );
        const endTime = performance.now();
        const transformTime = endTime - startTime;
        totalTransformTime += transformTime;


        // console.log(
        //   `Transform took ${ transformTime.toFixed(2) }ms for ${ filepath }(total: ${ totalTransformTime.toFixed(2) }ms)`,
        // );

        if (!transformedResult) {
          watchedFiles.delete(filepath);
          return;
        }
        watchedFiles.add(filepath);

        // during dev, invalidate the virtual CSS module
        if (server) {
          const virtualModuleId = resolvedVirtualModulePrefix + cssFilepath;
          const module = server.moduleGraph.getModuleById(virtualModuleId);
          if (module) server.reloadModule(module);

          // In atomic mode, also invalidate the .style-this.js module and schedule atomic entrypoint invalidation
          if (atomic) {
            const styleThisModuleId = resolvedVirtualModulePrefix + atomicProgramFilepath;
            const styleThisModule = server.moduleGraph.getModuleById(styleThisModuleId);
            if (styleThisModule) server.reloadModule(styleThisModule);

            // Schedule debounced invalidation of the atomic CSS entrypoint
            scheduleAtomicCssInvalidation();
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
        // we need to watch it since it might contain style templates
        watchedFiles.add(filepath);

        handleTransformError(filepath, code, err);
      }
    },
  } satisfies Plugin & ExtraFields;
};

export default vitePlugin;
