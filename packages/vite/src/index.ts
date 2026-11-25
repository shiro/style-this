import { DevEnvironment, Environment, EnvironmentModuleNode, Plugin, UserConfig, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { dirname, resolve as resolvePath } from "path";
import {
  Transformer,
  initializeStyleThis,
  CssCachEntry,
  CssSourceMapData,
} from "@style-this/core/compiler";
import { generateCssSourceMap } from "@style-this/core/cssSourceMap";
import { createRequire } from "node:module";
import { Filter, filterMatches, fromVirtualPath, isInNodeModules, normalizePath, splitQuery, timeoutPromise, TIMEOUT, toVirtualPath } from "./util";
import { handleTransformError } from "./util";
import { initializeSolidMocks } from "./solid";
import {
  isSvelteFile,
  extractSvelteScript,
  rewrapSvelteScript,
  svelteSources,
  svelteByteOffsetMapper,
  remapSvelteSourcemap,
  type SvelteSources,
} from "./svelte";
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
/** The extensions the compiler parses (oxc's `SourceType::from_path`). */
const transformExtensionRegex = /\.(?:[jt]sx?|[mc][jt]s)$/;
export const DefaultImport = Symbol();

export interface StyleThisViteOptions {
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
}

const vitePlugin = (options: StyleThisViteOptions = {}): Plugin & ExtraFields => {
  let { cssExtension = "css", filter = [], debug = false, atomic = false, useRequire, cacheRegistry = new CacheRegistry() } = options;

  if (!Array.isArray(filter)) filter = [filter];

  const debugLog = (...args: unknown[]) => {
    if (debug) console.log("[style-this]", ...args);
  };

  // an empty list ignores the whole module
  const ignoredImports: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(options.ignoredImports ?? {})) {
    if (value === true) {
      ignoredImports[key] = [];
    } else if (value.length > 0) {
      ignoredImports[key] = value.map((item) => (item === DefaultImport ? "__global__export__" : item));
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

  /** Files that contain styled templates. */
  const watchedFiles = new Set<string>();
  type Resolve = (id: string, importer: string) => Promise<string | undefined>;
  let createLoadFile: (resolve: Resolve) => (id: string, importer: string) => Promise<[string, string]>;
  let server: ViteDevServer | undefined;
  // the plugin instance can be reused for a build after serving, the build must not take the dev paths
  const devServer = (environment: Environment | undefined) => (environment?.mode === "build" ? undefined : server);
  let styleThis: Transformer;
  let cwd = process.cwd();
  const mocks = new Map<string, string>();

  const toVirtualId = (filepath: string) => resolvedVirtualModulePrefix + toVirtualPath(cwd, filepath);
  const fromVirtualId = (id: string) => fromVirtualPath(cwd, id.slice(resolvedVirtualModulePrefix.length));

  const atomicEntrypointId = resolvedVirtualModulePrefix + "__style_this_atomic_entrypoint.css";
  /**
   * Atomic CSS goes into the `utilities` layer, after a default Tailwind-like layer order. Users can override the
   * order by declaring their own `@layer` statement before the atomic entrypoint is imported.
   */
  const atomicLayerOrder = "@layer theme, base, components, utilities;";
  const wrapAtomicCss = (css: string) => `${atomicLayerOrder}\n@layer utilities {\n${css}\n}`;
  /**
   * Atomic CSS last served by the entrypoint, per environment and module id.
   *
   * The entrypoint can be loaded under several ids, e.g. SolidStart inlines SSR styles in dev by importing
   * `<id>?inline`. Each variant is a separate module that has to be invalidated on its own.
   */
  const servedAtomicCss = new Map<string, Map<string, string>>();
  let atomicCssUpdateTimer: NodeJS.Timeout | undefined;

  /** Reloads the atomic entrypoint in every environment that has served outdated atomic CSS. */
  const scheduleAtomicCssUpdate = () => {
    clearTimeout(atomicCssUpdateTimer);
    atomicCssUpdateTimer = setTimeout(() => {
      if (!server) return;
      const atomicCss = styleThis.get_atomic_css();
      for (const environment of Object.values(server.environments)) {
        const served = servedAtomicCss.get(environment.name);
        for (const id of new Set([atomicEntrypointId, ...(served?.keys() ?? [])])) {
          if (served?.get(id) === atomicCss) continue;
          const mod = environment.moduleGraph.getModuleById(id);
          if (!mod) {
            served?.delete(id);
            continue;
          }
          // only the plain CSS module is HMR-accepting in the browser, query variants (`?inline`, ...) are
          // re-fetched on their next import
          if (environment.config.consumer === "client" && id === atomicEntrypointId) reloadVirtualModule(environment, mod);
          else environment.moduleGraph.invalidateModule(mod);
        }
      }
    }, 20);
  };

  /**
   * Updates per timestamp and file, `hotUpdate` is called for each environment but invalidates once,
   * invalidating again would compare the file to itself and miss the affected importers.
   * Environments may handle interleaved updates (or be skipped through `applyToEnvironment`), so
   * entries can't be dropped once consumed, they're dropped once outdated instead.
   */
  const HMR_UPDATE_TTL = 60_000;
  const hmrUpdates = new Map<string, { timestamp: number; files: Promise<string[] | undefined> }>();

  /** Invalidates the changed file and the importers affected by the change, returns them. */
  const invalidateForHotUpdate = async (file: string, type: string, read: () => string | Promise<string>) => {
    if (!watchedFiles.has(file) && !styleThis.has_importers(file)) return;

    if (type === "delete") watchedFiles.delete(file);
    // unreadable files are invalidated like deleted ones
    let code = type === "delete" ? undefined : await Promise.resolve(read()).catch(() => undefined);
    if (code !== undefined && isSvelteFile(file)) code = extractSvelteScript(code) ?? undefined;
    const importers = styleThis.invalidate_file(file, code) as string[];

    const files = [file, ...importers];
    for (const filepath of files) {
      cacheRegistry.invalidateModule(filepath, cssExtension);
      cssSourceMapMetadata.delete(`${filepath}.${cssExtension}`);
    }
    return files;
  };

  /** `mapOffset` maps UTF-8 byte offsets in the transformed code to ones in `originalSource`. */
  const createCachePromise = (
    originalSource: string,
    mapOffset: (offset: number) => number = (offset) => offset,
  ): CssCachEntry => {
    let resolve: CssCachEntry["resolve"] | undefined;
    let settled = false;
    const entry = new Promise((_resolve, _reject) => {
      resolve = (
        css: string | Error,
        sourcemapData?: CssSourceMapData,
        filepath?: string,
      ) => {
        // invalidated entries are resolved early, the metadata of their outdated evaluations
        // must not replace the current one
        if (settled) return;
        settled = true;
        // Store source map metadata if provided
        if (
          !(css instanceof Error) &&
          sourcemapData &&
          filepath
        ) {
          cssSourceMapMetadata.set(filepath, {
            sourcemapData: sourcemapData.map((entry) => ({
              ...entry,
              start: mapOffset(entry.start),
              end: mapOffset(entry.end),
            })),
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

    // Expose dependency tracking for testing
    getTransitiveImporters(filepath: string, changedExports: string[]) {
      if (!styleThis) return [];
      return styleThis.get_transitive_importers(filepath, changedExports);
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

      // a plugin instance can be configured several times (e.g. reused for another build), a new transformer
      // would lose the evaluation state (atomic CSS, dependencies) of the CSS that's cached already
      if (styleThis) return;

      await initializeStyleThis();

      cwd = process.cwd();
      const require = createRequire(cwd + "/package.json");

      // like Node from the importer, monorepo packages can have their own dependencies, then from the project
      // for files outside of it
      const nodeResolve = (id: string, importer: string) =>
        normalizePath(require.resolve(id, { paths: [dirname(importer), cwd] }));

      createLoadFile = (resolve: Resolve) => async (
        id: string,
        importer: string,
      ): Promise<[string, string]> => {
        if (mocks.has(id)) return [nodeResolve(id, importer), mocks.get(id)!];

        let filepathWithQuery = await resolve(id, importer);

        if (filepathWithQuery == undefined)
          throw new Error(`vite failed to resolve import '${id}'`);

        const [filepath, rawQuery] = splitQuery(filepathWithQuery);
        // `?v=` of optimized deps in dev only busts the browser cache, it's the same module
        const query = rawQuery?.split("&").filter((param) => !param.startsWith("v=")).join("&") || undefined;

        if (filepath.startsWith(resolvedVirtualModulePrefix)) {
          const virtualPath = fromVirtualId(filepath);
          const entry = cacheRegistry.getCssModule(virtualPath);
          if (entry && entry !== undefined) {
            const content = await entry;
            return [virtualPath, typeof content === 'string' ? content : ''];
          }
          return [virtualPath, ''];
        }

        // modules with a query (e.g. `?raw`) are generated from the file by the compiler
        if (query !== undefined) return [`${filepath}?${query}`, await readFile(filepath, "utf-8")];

        if (
          !isInNodeModules(filepath) &&
          !id.startsWith("@style-this/")
        ) {
          try {
            const raw = await readFile(filepath, "utf-8");
            return [filepath, raw];
          } catch (err) { }
        }

        return [nodeResolve(id, importer), ""];
      };

      styleThis = new Transformer({
        cwd,
        ignoredImports,
        loadFile: createLoadFile(async () => {
          throw new Error("transform must be called with a plugin context loadFile");
        }),
        cacheRegistry,
        cssExtension,
        useRequire,
        debug,
        atomic,
        onDebugVirtualModule,
      });
    },

    resolveId(id, importer) {
      if (id === '@style-this/core/atomic') return atomicEntrypointId;

      if (id.startsWith(virtualModulePrefix)) {
        if (!importer)
          throw new Error(`Virtual module '${id}' must be imported from another module, not loaded directly`);

        const idPart = id.slice(virtualModulePrefix.length);

        return toVirtualId(resolvePath(dirname(importer), idPart));
      }

      if (importer && importer.startsWith(resolvedVirtualModulePrefix) && importer.endsWith('.style-this.js')) {
        const virtualPath = fromVirtualId(importer);
        const sourceFilePath = virtualPath.slice(0, -'.style-this.js'.length);

        if ((id.startsWith('./') || id.startsWith('../')) && sourceFilePath) {
          return normalizePath(resolvePath(dirname(sourceFilePath), id));
        }
      }
    },

    async load(fullId) {
      if (!fullId.startsWith(resolvedVirtualModulePrefix)) return;

      const [id] = splitQuery(fullId);
      const server = devServer(this.environment);

      if (id === atomicEntrypointId) {
        if (atomic) {
          // the atomic CSS is only complete once all modules are transformed, it's set in `renderChunk`
          if (!server) {
            return { code: atomicLayerOrder };
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

          const environmentName = this.environment?.name ?? "client";
          let served = servedAtomicCss.get(environmentName);
          if (!served) servedAtomicCss.set(environmentName, (served = new Map()));
          served.set(fullId, atomicCss);

          return {
            code: wrapAtomicCss(atomicCss),
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
            handleTransformError(sourceFilepath, entry.code, resolved);

          // Ensure resolved is a string
          if (typeof resolved !== "string") {
            throw new Error(`Unexpected CSS resolution type: ${typeof resolved}`);
          }

          if (!isAtomicProgram) {
            const metadata = cssSourceMapMetadata.get(filepath);
            if (metadata) {
              const sourcemap = generateCssSourceMap(
                resolved,
                metadata.sourcemapData,
                sourceFilepath,
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

    buildEnd(error) {
      if (!atomic || error || devServer(this.environment) || this.getModuleInfo(atomicEntrypointId)) return;
      if (styleThis.get_atomic_css()) {
        this.warn(`atomic CSS is dropped, '@style-this/core/atomic' isn't imported`);
      }
    },

    /**
     * Sets the atomic CSS of the entrypoint before vite's CSS plugin collects the chunk's stylesheet (this plugin's
     * hooks run first), so it's minified and hashed like any other CSS.
     */
    async renderChunk(_code, chunk) {
      if (!atomic || devServer(this.environment) || !(atomicEntrypointId in chunk.modules)) return null;

      // the build CSS is recorded by the plugin's `transform`, it doesn't use the plugin context
      const transform = this.environment.plugins.find((plugin) => plugin.name === "vite:css-post")?.transform;
      const handler = typeof transform === "function" ? transform : transform?.handler;
      if (!handler) this.error("vite's 'vite:css-post' plugin wasn't found, the atomic CSS can't be emitted");

      await handler.call(this as any, wrapAtomicCss(styleThis.get_atomic_css()), atomicEntrypointId);
      return null;
    },

    closeBundle() {
      if (devServer(this.environment)) clearTimeout(atomicCssUpdateTimer);
    },

    async hotUpdate({ file, type, timestamp, modules, read }) {
      const key = `${timestamp}:${file}`;
      let update = hmrUpdates.get(key);
      if (!update) {
        // entries are inserted in about timestamp order, outdated ones left behind are dropped later
        for (const [outdatedKey, outdated] of hmrUpdates) {
          if (outdated.timestamp >= timestamp - HMR_UPDATE_TTL) break;
          hmrUpdates.delete(outdatedKey);
        }
        update = { timestamp, files: invalidateForHotUpdate(file, type, read) };
        hmrUpdates.set(key, update);
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

    transform: {
      // before the transforms of other `enforce: "pre"` plugins wherever it's listed, framework compilers
      // (e.g. Svelte's) output code the styles can't be extracted from
      order: "pre",
      async handler(code, filepath) {
        if (
          !filepath ||
          filepath.startsWith("\0") ||
          isInNodeModules(filepath) ||
          filepath.includes("?") ||
          filepath.endsWith(".style-this.js") ||
          (!transformExtensionRegex.test(filepath) && !isSvelteFile(filepath))
        ) {
          return;
        }

        if (!filterMatches(filter, filepath)) {
          return;
        }

        let codeToTransform = code;
        let svelte: SvelteSources | undefined;
        let mapOffset: ((offset: number) => number) | undefined;

        if (isSvelteFile(filepath)) {
          svelte = svelteSources(code) ?? undefined;
          // without a script it's only transformed (as empty) if it was before, which drops its imports
          if (!svelte && !watchedFiles.has(filepath)) return;
          codeToTransform = svelte?.program ?? "";
          mapOffset = svelte && svelteByteOffsetMapper(svelte);
        }

        const cssFilepath = `${filepath}.${cssExtension}`;
        const atomicProgramFilepath = `${filepath}.style-this.js`;

        const skipCssEval = cacheRegistry.hasCssModule(cssFilepath) && (!atomic || cacheRegistry.hasAtomicModule(atomicProgramFilepath));

        try {
          const startTime = performance.now();

          if (atomic && !cacheRegistry.hasAtomicModule(atomicProgramFilepath)) {
            cacheRegistry.setAtomicModule(atomicProgramFilepath, createCachePromise(code, mapOffset));
          }

          if (!cacheRegistry.hasCssModule(cssFilepath)) {
            cacheRegistry.setCssModule(cssFilepath, createCachePromise(code, mapOffset));
          }

          const transformedResult = await styleThis.transform(
            codeToTransform,
            filepath,
            skipCssEval,
            // resolve within this transform's own environment/context, other contexts may resolve
            // differently or be disposed already
            createLoadFile(async (id, importer) => id ? (await this.resolve(id, importer))?.id : undefined),
          );
          if (!transformedResult) {
            watchedFiles.delete(filepath);
            // the compiler resolves these as empty, they would be taken as cached CSS once the file gains styles
            cacheRegistry.invalidateModule(filepath, cssExtension);
            return;
          }
          debugLog(`transformed ${filepath} in ${(performance.now() - startTime).toFixed(1)}ms`);
          watchedFiles.add(filepath);

          const server = devServer(this.environment);
          if (server && !skipCssEval) {
            for (const environment of Object.values(server.environments)) {
              if (environment.config.consumer !== "client") continue;
              const cssModule = environment.moduleGraph.getModuleById(toVirtualId(cssFilepath));
              if (cssModule?.importers.size) reloadVirtualModule(environment, cssModule);
            }

            if (atomic) cacheRegistry.getAtomicModule(atomicProgramFilepath)?.then(scheduleAtomicCssUpdate);
          }

          if (svelte) {
            const rewrapped = rewrapSvelteScript(code, transformedResult.code);
            return { code: rewrapped.file, map: remapSvelteSourcemap(transformedResult.sourcemap, svelte, rewrapped) };
          }

          return {
            code: transformedResult.code,
            map: transformedResult.sourcemap,
          };
        } catch (err) {
          watchedFiles.add(filepath);
          handleTransformError(filepath, code, err);
        }
      },
    },
  };
};

export default vitePlugin;
