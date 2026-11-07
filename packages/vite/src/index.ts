import { DevEnvironment, EnvironmentModuleNode, Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { isAbsolute, relative, resolve as resolvePath } from "path";
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

/**
 * Sends a virtual module (css) to the client as an HMR update.
 *
 * Don't use `environment.reloadModule` for this: it marks the module's transitive importers as HMR-updated too (their
 * `?t=` import timestamps change) even though they're never sent to the client. When such an importer is later fetched
 * in a batch update, it imports the source module under a new URL than the one in the update payload, so the source
 * module executes twice and solid-refresh keeps rendering the registry that never receives further updates.
 */
const reloadVirtualModule = (environment: DevEnvironment, mod: EnvironmentModuleNode) => {
  if (environment.config.server.hmr === false) return;
  environment.moduleGraph.invalidateModule(mod);
  const timestamp = Math.max(Date.now(), mod.lastHMRTimestamp + 1);
  mod.lastHMRTimestamp = timestamp;
  environment.hot.send({
    type: "update",
    updates: [
      {
        type: "js-update",
        path: mod.url,
        acceptedPath: mod.url,
        timestamp,
        explicitImportRequired: false,
        isWithinCircularImport: false,
      },
    ],
  });
};

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
export const DefaultImport = Symbol();

interface Options {
  include?: RegExp[];
  exclude?: RegExp[];
  cssExtension?: string;
  filter?: Filter | Filter[];
  ignoredImports?: Record<string, true | (string | typeof DefaultImport)[]>;
  /** Logs transforms and keeps intermediate programs for inspection. @default false */
  debug?: boolean;
  atomic?: boolean;
  useRequire?: boolean;
  cacheRegistry?: CacheRegistry;
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps" | "ssr"> { }

export interface ExtraFields {
  cssExtension: string;
  __mocks: Map<string, string>;
  __getDebugVirtualModules: () => Record<string, string>;
  getTransitiveImporters(filepath: string, changedExports: string[]): string[];
  getFileExports(filepath: string): string[];
  clearFileImports(filepath: string): void;
  clearValueCache(filepath: string): void;
  invalidateModule(filepath: string): void;
}

const vitePlugin = (options: Options = {}) => {
  let { cssExtension = "css", filter = [], debug = false, atomic = false, useRequire, cacheRegistry = new CacheRegistry() } = options;

  if (!Array.isArray(filter)) filter = [filter];

  const debugLog = (...args: unknown[]) => {
    if (debug) console.log("[style-this]", ...args);
  };

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

  // the same module can be evaluated multiple times with the same key, keep every evaluation
  const onDebugVirtualModule = (name: string, code: string) => {
    let key = name;
    for (let i = 2; debugVirtualModules.has(key); i++) key = `${name} #${i}`;
    debugVirtualModules.set(key, code);
  };

  // Default noop callback for non-debug mode
  const noopCallback = () => { };

  /** Files that contain styled templates. */
  const watchedFiles = new Set<string>();
  type Resolve = (id: string, importer: string) => Promise<string | undefined>;
  let createLoadFile: (resolve: Resolve) => (id: string, importer: string) => Promise<[string, string]>;
  let server: ViteDevServer | undefined;
  let styleThis: Transformer;
  let cwd = process.cwd();
  const mocks = new Map<string, string>();

  // resolved ids end up in bundle output (e.g. region comments), keep them relative to `cwd` so
  // output and chunk hashes don't depend on the project location
  const toVirtualId = (filepath: string) => {
    const relativePath = relative(cwd, filepath);
    return resolvedVirtualModulePrefix + (relativePath.startsWith("..") || isAbsolute(relativePath) ? filepath : relativePath);
  };
  const fromVirtualId = (id: string) => resolvePath(cwd, id.slice(resolvedVirtualModulePrefix.length));

  const atomicEntrypointId = resolvedVirtualModulePrefix + "__style_this_atomic_entrypoint.css";
  /** Atomic CSS last served by the entrypoint, per environment. */
  const servedAtomicCss = new Map<string, string>();
  let atomicCssUpdateTimer: NodeJS.Timeout | undefined;

  /** Reloads the atomic entrypoint in every environment that has served outdated atomic CSS. */
  const scheduleAtomicCssUpdate = () => {
    clearTimeout(atomicCssUpdateTimer);
    atomicCssUpdateTimer = setTimeout(() => {
      if (!server) return;
      const atomicCss = styleThis.get_atomic_css();
      for (const environment of Object.values(server.environments)) {
        const mod = environment.moduleGraph.getModuleById(atomicEntrypointId);
        if (!mod || servedAtomicCss.get(environment.name) === atomicCss) continue;
        if (environment.config.consumer === "client") reloadVirtualModule(environment, mod);
        else environment.moduleGraph.invalidateModule(mod);
      }
    }, 20);
  };

  /** Latest update per file, `hotUpdate` is called for each environment but invalidates once. */
  const hmrUpdates = new Map<string, { timestamp: number; files: Promise<string[] | undefined> }>();

  /** Invalidates the changed file and the importers affected by the change, returns them. */
  const invalidateForHotUpdate = async (file: string, type: string, read: () => string | Promise<string>) => {
    if (!watchedFiles.has(file) && !styleThis.has_importers(file)) return;

    if (type === "delete") watchedFiles.delete(file);
    // unreadable files are invalidated like deleted ones
    const code = type === "delete" ? undefined : await Promise.resolve(read()).catch(() => undefined);
    const importers = styleThis.invalidate_file(file, code) as string[];

    const files = [file, ...importers];
    for (const filepath of files) {
      cacheRegistry.invalidateModule(filepath, cssExtension);
      cssSourceMapMetadata.delete(`${filepath}.${cssExtension}`);
    }
    return files;
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

    // Expose dependency tracking methods for testing
    getTransitiveImporters(filepath: string, changedExports: string[]) {
      if (!styleThis) return [];
      return styleThis.get_transitive_importers(filepath, changedExports);
    },

    getFileExports(filepath: string) {
      if (!styleThis) return [];
      return styleThis.get_file_exports(filepath);
    },

    clearFileImports(filepath: string) {
      if (!styleThis) return;
      styleThis.clear_file_imports(filepath);
    },

    clearValueCache(filepath: string) {
      if (!styleThis) return;
      styleThis.clear_value_cache(filepath);
    },

    invalidateModule(filepath: string) {
      cacheRegistry.invalidateModule(filepath);
    },

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

      // externalized packages are imported by node directly during SSR, skipping `resolveId`,
      // `@style-this/core/atomic` must be resolved to the virtual atomic CSS module instead
      const noExternal = config.ssr?.noExternal;
      if (noExternal !== true) {
        config.ssr = {
          ...(config.ssr ?? {}),
          noExternal: [
            ...(noExternal == undefined ? [] : Array.isArray(noExternal) ? noExternal : [noExternal]),
            "@style-this/core",
          ],
        };
      }

      await initializeStyleThis();

      cwd = process.cwd();
      const require = createRequire(cwd + "/package.json");

      createLoadFile = (resolve: Resolve) => async (
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
          const virtualPath = fromVirtualId(filepath);
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
        loadFile: createLoadFile(async () => {
          throw new Error("transform must be called with a plugin context loadFile");
        }),
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
        if (!importer)
          throw new Error(`Virtual module '${id}' must be imported from another module, not loaded directly`);

        const idPart = id.slice(virtualModulePrefix.length);
        const importerDir = require('path').dirname(importer);
        const absoluteIdPart = require('path').resolve(importerDir, idPart);

        return toVirtualId(absoluteIdPart);
      }

      if (importer && importer.startsWith(resolvedVirtualModulePrefix) && importer.endsWith('.style-this.js')) {
        const virtualPath = fromVirtualId(importer);
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

      if (id === atomicEntrypointId) {
        if (atomic) {
          if (!server) {
            return { code: '' };
          }

          // wait for pending atomic modules, ones that aren't transformed yet trigger a reload once
          // they resolve (see `scheduleAtomicCssUpdate`)
          await Promise.all(
            Array.from(watchedFiles, (file) => cacheRegistry.getAtomicModule(`${file}.style-this.js`)),
          );

          const atomicCss = styleThis.get_atomic_css();

          if (typeof atomicCss !== "string") {
            throw new Error(`Unexpected atomic CSS type: ${typeof atomicCss}`);
          }

          servedAtomicCss.set(this.environment?.name ?? "client", atomicCss);

          return {
            code: atomicCss,
          };
        } else {
          return {
            code: '/* @style-this/core/atomic is a no-op in non-atomic mode */',
          };
        }
      }

      const filepath = fromVirtualId(id);
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
      // in dev, HMR is handled by `hotUpdate`, watching here would reload the virtual module
      // before its source file is re-transformed
      if (!server) this.addWatchFile(sourceFilepath);

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
        this.emitFile({
          type: 'asset',
          fileName: 'assets/atomic.css',
          source: finalAtomicCss,
        });
      }
    },

    async hotUpdate({ file, type, timestamp, modules, read }) {
      let update = hmrUpdates.get(file);
      if (update?.timestamp !== timestamp) {
        update = { timestamp, files: invalidateForHotUpdate(file, type, read) };
        hmrUpdates.set(file, update);
      }
      const files = await update.files;
      if (!files) return;

      const { moduleGraph } = this.environment;
      const result = new Set(modules);

      for (const filepath of files) {
        for (const mod of moduleGraph.getModulesByFile(filepath) ?? []) result.add(mod);

        // CSS modules are self-accepting and would be requested before the re-transform, they
        // get reloaded from `transform` once ready instead
        const cssModule = moduleGraph.getModuleById(toVirtualId(`${filepath}.${cssExtension}`));
        if (cssModule) moduleGraph.invalidateModule(cssModule);

        const atomicModule = moduleGraph.getModuleById(toVirtualId(`${filepath}.style-this.js`));
        if (atomicModule) result.add(atomicModule);
      }

      return [...result];
    },

    async transform(code, filepath) {
      if (
        !filepath ||
        filepath.startsWith("\0") ||
        filepath.includes("/node_modules/") ||
        filepath.includes("?") ||
        filepath.endsWith(".style-this.js") ||
        (!/\.[mc]?[jt]sx?$/.test(filepath) && !isSvelteFile(filepath))
      ) {
        return;
      }

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
          // resolve within this transform's own environment/context, other contexts may resolve
          // differently or be disposed already
          createLoadFile(async (id, importer) => id ? (await this.resolve(id, importer))?.id : undefined),
        );
        if (!transformedResult) {
          watchedFiles.delete(filepath);
          return;
        }
        debugLog(`transformed ${filepath} in ${(performance.now() - startTime).toFixed(1)}ms`);
        watchedFiles.add(filepath);

        if (server && !skipCssEval) {
          for (const environment of Object.values(server.environments)) {
            if (environment.config.consumer !== "client") continue;
            const cssModule = environment.moduleGraph.getModuleById(toVirtualId(cssFilepath));
            if (cssModule?.importers.size) reloadVirtualModule(environment, cssModule);
          }

          if (atomic) cacheRegistry.getAtomicModule(atomicProgramFilepath)?.then(scheduleAtomicCssUpdate);
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
