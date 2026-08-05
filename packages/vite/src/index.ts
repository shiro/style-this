/// <reference path="../global.d.ts" />
import { Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import {
  Transformer,
  initializeStyleThis,
  CssCachEntry,
  CssSourceMapData,
} from "@style-this/core/compiler";
import { generateCssSourceMap } from "@style-this/core/cssSourceMap";
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
  atomic?: boolean;
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> { }

export interface ExtraFields {
  cssExtension: string;
  __mocks: Map<string, string>;
  __getTemporaryPrograms: () => Record<string, string>;
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [], debug, atomic = false } = options;

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

  // Store source map metadata alongside CSS cache
  const cssSourceMapMetadata = new Map<
    string,
    { sourcemapData: CssSourceMapData; originalSource: string }
  >();

  // Store actual .style-this.js content separately (for atomic mode)
  // This allows updating content even after promise is resolved
  const styleThisActualContent = new Map<string, string>();

  if (!global.__styleThis_valueCache) {
    global.__styleThis_valueCache = {};
  }
  const valueCache = global.__styleThis_valueCache;

  if (debug && !global.__styleThis_temporaryPrograms) {
    global.__styleThis_temporaryPrograms = {};
  }

  /** Files that contain styled templates, changes cause all importers to reload. */
  const watchedFiles = new Set<string>();
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

        // For virtual modules (style-this virtual modules), load from cache
        if (filepath.startsWith(resolvedVirtualModulePrefix)) {
          const virtualPath = filepath.slice(resolvedVirtualModulePrefix.length);
          const entry = cssCache.get(virtualPath);
          if (entry) {
            // Wait for the entry to resolve
            const content = await entry;
            // For .style-this.js files in atomic mode, get actual content from map
            if (atomic && virtualPath.endsWith('.style-this.js')) {
              const actualContent = styleThisActualContent.get(virtualPath) || '';
              return [virtualPath, actualContent];
            }
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
        valueCache,

        cssExtension,

        useRequire: (options as any).useRequire,
        debug,
        atomic,
      });
      
      // In atomic mode, set up global helper functions
      if (atomic) {
        const { css_to_atomic_class_list, get_atomic_css, extract_non_atomic_css_js } = await import("@style-this/core/compiler");
        (globalThis as any).__styleThis_cssToAtomicClassList = css_to_atomic_class_list;
        (globalThis as any).__styleThis_getAtomicCss = get_atomic_css;
        (globalThis as any).__styleThis_extractNonAtomicCss = extract_non_atomic_css_js;
        // Also set on global for compatibility
        (global as any).__styleThis_cssToAtomicClassList = css_to_atomic_class_list;
        (global as any).__styleThis_getAtomicCss = get_atomic_css;
        (global as any).__styleThis_extractNonAtomicCss = extract_non_atomic_css_js;
      }
    },

    resolveId(id, importer) {
      // Handle @style-this/core/atomic imports
      if (id === '@style-this/core/atomic') {
        // Use a global atomic CSS file, not per-importer
        const atomicPath = `${virtualModulePrefix}__global__.atomic.css`;
        return resolvedVirtualModulePrefix + atomicPath.slice(virtualModulePrefix.length);
      }
      
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

        // Handle .atomic.css files - return accumulated atomic CSS or empty in non-atomic mode
        if (filepath.endsWith('.atomic.css')) {
          // Tell Vite this depends on the source file for HMR
          const sourceFilepath = filepath.slice(0, -'.atomic.css'.length);
          this.addWatchFile(sourceFilepath);
          
          if (atomic) {
            const { get_atomic_css } = await import("@style-this/core/compiler");
            const atomicCss = get_atomic_css();
            
            return {
              code: atomicCss,
            };
          } else {
            // Non-atomic mode: no-op
            return {
              code: '/* @style-this/core/atomic is a no-op in non-atomic mode */',
            };
          }
        }

        const entry = cssCache.get(filepath);

        if (entry == undefined)
          throw new Error(
            `failed to load virtual CSS file '${filepath}' from id '${id}'`,
          );

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
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(TIMEOUT), TIMEOUT_DURATION);
          });

          try {
            const resolved = await Promise.race([entry, timeoutPromise]);

            if (resolved instanceof Error)
              handleTransformError(id, entry.code, resolved);

            // Ensure resolved is a string
            if (typeof resolved !== "string") {
              throw new Error(`Unexpected CSS resolution type: ${typeof resolved}`);
            }

            // For .style-this.js files in atomic mode, return actual content from map
            // This allows the content to be updated even after promise was resolved
            let finalContent = resolved;
            if (atomic && filepath.endsWith('.style-this.js')) {
              finalContent = styleThisActualContent.get(filepath) || resolved;
            }

            // Generate source map if we have metadata
            const metadata = cssSourceMapMetadata.get(filepath);
            if (metadata) {
              // Ensure source filepath is absolute for proper browser resolution
              const absoluteSourcePath = sourceFilepath.startsWith('/')
                ? sourceFilepath
                : `/${sourceFilepath}`;

              const sourcemap = generateCssSourceMap(
                finalContent,
                metadata.sourcemapData,
                absoluteSourcePath,
                metadata.originalSource,
                filepath,
              );

              return {
                code: finalContent,
                map: sourcemap,
              };
            }

            // Return without source map if no metadata
            return {
              code: finalContent,
            };
          } catch (error) {
            if (error == TIMEOUT) {
              time += TIMEOUT_DURATION;
              console.warn(`CSS entry '${filepath}' loading for over ${time}sec, might be a deadlock`);
            } else {
              throw error;
            }
          }
        }
      }
    },

    async generateBundle(options, bundle) {
      // In atomic mode, inject accumulated atomic CSS into the bundle
      if (atomic) {
        const { get_atomic_css } = await import("@style-this/core/compiler");
        const atomicCss = get_atomic_css();
        
        if (atomicCss) {
          // Find the main CSS file and append atomic CSS to it
          for (const [fileName, output] of Object.entries(bundle)) {
            if (output.type === 'asset' && fileName.endsWith('.css')) {
              output.source = atomicCss + '\n' + output.source;
              break; // Only inject into the first CSS file
            }
          }
        }
      }
    },

    async handleHotUpdate(ctx) {
      if (!watchedFiles.has(ctx.file)) return;

      // remove from cache
      valueCache[ctx.file] = {};
      const cssFilepath = `${ctx.file}.${cssExtension}`;
      const styleThisFilepath = `${ctx.file}.style-this.js`;
      
      cssCache.delete(cssFilepath);
      cssSourceMapMetadata.delete(cssFilepath);
      
      // In atomic mode, also clear .style-this.js cache and atomic CSS cache
      if (atomic) {
        cssCache.delete(styleThisFilepath);
        const { clear_atomic_css_cache } = await import("@style-this/core/compiler");
        clear_atomic_css_cache();
      }

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
        filepath.endsWith(".atomic.css")
      )
        return;

      if (!filterMatches(filter, filepath)) {
        return;
      }

      // Extract script block from Svelte files
      let codeToTransform = code;
      let isSvelte = false;
      let filepathForRust = filepath;
      if (filepath.endsWith(".svelte")) {
        isSvelte = true;
        const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
          codeToTransform = scriptMatch[1];
          // Use a .ts extension for the Rust compiler
          filepathForRust = filepath.replace(/\.svelte$/, '.ts');
        } else {
          // No script block, nothing to transform
          return;
        }
      }

      // For Svelte files, use the modified filepath for the import source so it matches what Rust generates
      const importSourceFilepath = isSvelte ? filepathForRust : filepath;
      const importSource = `${virtualModulePrefix}${importSourceFilepath}.${cssExtension}`;
      // But always use the original filepath for cache keys
      const cssFilepath = `${importSourceFilepath}.${cssExtension}`;
      const styleThisFilepath = `${importSourceFilepath}.style-this.js`;
      // In atomic mode, also check if .style-this.js is cached
      const skipCssEval = atomic 
        ? (cssCache.has(cssFilepath) && cssCache.has(styleThisFilepath))
        : cssCache.has(cssFilepath);

      try {
        const startTime = performance.now();

        if (!skipCssEval) {
          // Create cache entry for CSS file
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
                  originalSource: code,
                });
              }
              _resolve(css);
            };
          }) as CssCachEntry;
          entry.resolve = resolve!;
          entry.code = code;

          cssCache.set(cssFilepath, entry);
          
          // In atomic mode, also create cache entry for .style-this.js file
          // This will be resolved during CSS evaluation by the rust code
          if (atomic) {
            // In atomic mode, create a resolvable cache entry for .style-this.js
            // We resolve it immediately with empty string to prevent hang during transform
            // The rust code will update styleThisActualContent map with real content during CSS evaluation
            let styleThisResolve: CssCachEntry["resolve"] | undefined;
            
            const styleThisEntry = new Promise((_resolve, _reject) => {
              styleThisResolve = (css: string | Error) => {
                // Update the actual content map when rust code calls resolve
                if (typeof css === 'string') {
                  styleThisActualContent.set(styleThisFilepath, css);
                }
                _resolve(css);
              };
            }) as CssCachEntry;
            styleThisEntry.resolve = styleThisResolve!;
            styleThisEntry.code = code;
            
            // Initialize with empty content
            styleThisActualContent.set(styleThisFilepath, '');
            
            // Resolve immediately with empty module to prevent hang during transform
            // The rust code will call resolve() again with real content, updating the map
            styleThisResolve!('');
            
            cssCache.set(styleThisFilepath, styleThisEntry);
          }
        }

        const transformedResult = await styleThis.transform(
          codeToTransform,
          filepathForRust,
          skipCssEval,
          importSource,
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
          
          // In atomic mode, also invalidate the .style-this.js module and .atomic.css
          if (atomic) {
            const styleThisModuleId = resolvedVirtualModulePrefix + styleThisFilepath;
            const styleThisModule = server.moduleGraph.getModuleById(styleThisModuleId);
            if (styleThisModule) server.reloadModule(styleThisModule);
            
            // Invalidate all .atomic.css modules (there could be multiple files importing it)
            for (const [id, mod] of server.moduleGraph.idToModuleMap) {
              if (id.includes('.atomic.css')) {
                server.reloadModule(mod);
              }
            }
          }
        }

        return {
          code: isSvelte
            ? code.replace(
                /<script[^>]*>([\s\S]*?)<\/script>/,
                `<script>${transformedResult.code}</script>`
              )
            : transformedResult.code,
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
