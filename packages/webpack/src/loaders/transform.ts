import type { Compiler, RawLoaderDefinitionFunction } from "webpack";
import {
  initializeStyleThis,
  Transformer,
  type CssCachEntry,
  type VirtualImportKind,
} from "@style-this/core/compiler";
import { locateTransformError } from "@style-this/core/transformError";
import { readFile } from "fs/promises";
import { createRequire } from "node:module";
import { noopFileImportFilepath } from "./consts";
import { chainSourceMap, makeLoadFile } from "./shared";

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;

export type LoaderConfig = {
  /**
   * Loaders with the same `key` share a transformer and its cache, it's created with the config of
   * the first one. It must identify the config.
   */
  key: string;
  atomic: boolean;
  resolveVirtualImport: (kind: VirtualImportKind, filepath: string) => string;
  useRequire?: boolean;
};

/** The config of a loader, from its options and the project directory (`rootContext`). */
type GetConfig<Options> = (options: Options, rootContext: string) => LoaderConfig;

export const cssExtension = "css";
export const atomicProgramExtension = "style-this.js";

/**
 * The transformer of a config with the virtual modules it resolved: the CSS of `<filepath>.css` in
 * `cssFiles`, in atomic mode the class module of `<filepath>.style-this.js` in `atomicFiles`.
 */
type State = {
  transformer: Promise<Transformer>;
  cssFiles: Map<string, CssCachEntry>;
  atomicFiles: Map<string, CssCachEntry>;
};

// per process and config rather than per compiler: Turbopack runs the loaders without one (in a pool of
// processes), and compilers with the same config can share the cache, it's checked against the files on disk
const states = new Map<string, State>();

export const getState = (config: LoaderConfig) => {
  let state = states.get(config.key);
  if (!state) {
    const cssFiles = new Map<string, CssCachEntry>();
    const atomicFiles = new Map<string, CssCachEntry>();
    const transformer = initializeStyleThis().then(
      () =>
        new Transformer({
          cwd: process.cwd(),
          ignoredImports: {},
          // each transform passes the `loadFile` of its loader context
          loadFile: async () => {
            throw new Error("transform must be called with a loader context loadFile");
          },
          resolveVirtualImport: config.resolveVirtualImport,
          createRequire: createRequire(import.meta.url),
          // the compiler resolves the virtual modules into these
          cacheRegistry: {
            initializeRefs(cssRef, atomicRef) {
              Object.assign(globalThis, { [cssRef]: cssFiles, [atomicRef]: atomicFiles });
            },
          },
          cssExtension,
          useRequire: config.useRequire,
          atomic: config.atomic,
        }),
    );
    state = { transformer, cssFiles, atomicFiles };
    states.set(config.key, state);
  }
  return state;
};

/** Drops the virtual modules of `filepath`, they're evaluated again when requested. */
const deleteVirtualModules = (state: State, filepath: string) => {
  state.cssFiles.delete(`${filepath}.${cssExtension}`);
  state.atomicFiles.delete(`${filepath}.${atomicProgramExtension}`);
};

/**
 * Drops the cache of the files removed in watch mode (deleted or renamed) and the virtual modules of
 * the files affected, they'd be kept for the lifetime of the process otherwise.
 */
export const dropRemovedFiles = (compiler: Compiler, config: LoaderConfig) =>
  compiler.hooks.watchRun.tapPromise("StyleThisPlugin", async ({ removedFiles }) => {
    const state = states.get(config.key);
    if (!state || !removedFiles?.size) return;
    const transformer = await state.transformer;
    for (const file of removedFiles) {
      for (const filepath of [file, ...(transformer.invalidate_file(file, undefined) as string[])]) {
        deleteVirtualModules(state, filepath);
      }
    }
  });

const createEntry = (code: string) => {
  let resolve: CssCachEntry["resolve"] | undefined;
  const entry = new Promise((_resolve) => {
    resolve = (value: string | Error) => _resolve(value);
  }) as CssCachEntry;
  entry.resolve = resolve!;
  entry.code = code;
  return entry;
};

/**
 * Invalidates the dependencies `filepath` was evaluated from that changed since, and the virtual
 * modules of the files affected by the change. Loaders aren't told which files changed (and
 * Turbopack runs them in several processes, each with its own cache), so they're read again.
 */
const refreshDependencies = async (ctx: LoaderCtx, state: State, filepath: string) => {
  const transformer = await state.transformer;
  const dependencies = transformer.get_evaluated_dependencies(filepath) as string[];

  await Promise.all(
    dependencies.map(async (dependency) => {
      // skipped evaluations don't resolve (and add) the dependencies
      ctx.addDependency(dependency);
      const code = await readFile(dependency, "utf-8").catch(() => undefined);
      for (const importer of transformer.invalidate_file(dependency, code) as string[]) {
        deleteVirtualModules(state, importer);
      }
    }),
  );
};

/**
 * The error the transform of `filepath` from `code` failed with, located like vite's. Webpack and Next show the
 * message of loader errors, it includes the location and code frame, the stack is in the error details.
 */
const transformError = (err: unknown, filepath: string, code: string) => {
  if (!(err instanceof Error)) return err;
  const { error, file, loc, frame } = locateTransformError(err, filepath, code);
  const location = loc ? `${file}:${loc.line}:${loc.column}` : file;
  const message = `${location}: ${error.message}${frame ? `\n\n${frame}` : ""}`;
  return Object.assign(new Error(message, { cause: error }), { stack: error.stack, hideStack: true });
};

/** Transforms `code`, its virtual modules are stored in the config's `State` for their loaders. */
const transformFile = async (ctx: LoaderCtx, config: LoaderConfig, code: string, filepath: string) => {
  const state = getState(config);
  const { cssFiles, atomicFiles } = state;
  const transformer = await state.transformer;
  await refreshDependencies(ctx, state, filepath);

  const cssFilepath = `${filepath}.${cssExtension}`;
  const atomicProgramFilepath = `${filepath}.${atomicProgramExtension}`;
  const skipCssEval =
    cssFiles.get(cssFilepath)?.code === code &&
    (!config.atomic || atomicFiles.get(atomicProgramFilepath)?.code === code);

  // resolved by the compiler through the transformer's `cacheRegistry`
  if (!skipCssEval) {
    cssFiles.set(cssFilepath, createEntry(code));
    if (config.atomic) atomicFiles.set(atomicProgramFilepath, createEntry(code));
  }

  try {
    return await transformer.transform(code, filepath, skipCssEval, makeLoadFile(ctx));
  } catch (err) {
    // the compiler resolves the stored entries with the error, drop them or later transforms would
    // skip CSS evaluation and keep serving the error
    deleteVirtualModules(state, filepath);
    throw transformError(err, filepath, code);
  }
};

/** Transforms the JS/TS modules, their virtual modules are imported from the noop files with `?filepath=`. */
export const createTransformLoader =
  <Options extends object>(getConfig: GetConfig<Options>): RawLoaderDefinitionFunction<Options> =>
  function (code, inputSourceMap) {
    const callback = this.async();

    transformFile(this, getConfig(this.getOptions(), this.rootContext), code.toString(), this.resourcePath).then(
      (result) =>
        result
          ? callback(null, result.code, chainSourceMap(result.sourcemap, inputSourceMap))
          : callback(null, code, inputSourceMap),
      (err) => callback(err),
    );
  };

/** A loader serving a virtual module of the file in `?filepath=`, see `loadVirtualModule`. */
const virtualModuleLoader =
  <Options extends object>(
    getConfig: GetConfig<Options>,
    load: (ctx: LoaderCtx, config: LoaderConfig, filepath: string) => Promise<string>,
  ): RawLoaderDefinitionFunction<Options> =>
  function () {
    const callback = this.async();

    // the loader rules only match imports with `?filepath=`
    const filepath = noopFileImportFilepath(this.resourcePath, this.resourceQuery);

    load(this, getConfig(this.getOptions(), this.rootContext), filepath).then(
      (code) => callback(null, code),
      (err) => callback(err),
    );
  };

/**
 * Loads the virtual module of `filepath` stored in the `store` of the config's `State` under `key`.
 * Turbopack runs loaders in a pool of processes (and webpack caches the transformed file), so the
 * file may not have been transformed in this process, it's transformed again if this process has no
 * (or an outdated) module for it.
 */
const loadVirtualModule = async (
  ctx: LoaderCtx,
  config: LoaderConfig,
  filepath: string,
  store: "cssFiles" | "atomicFiles",
  key: string,
) => {
  ctx.addDependency(filepath);
  const code = await readFile(filepath, "utf-8").catch(() => undefined);

  // the module is outdated if dependencies changed, even though `filepath` didn't
  const state = getState(config);
  await refreshDependencies(ctx, state, filepath);

  if (code !== undefined && state[store].get(key)?.code !== code) {
    if (!(await transformFile(ctx, config, code, filepath))) return "";
  }

  const entry = state[store].get(key);
  const module = await entry;
  if (module instanceof Error) throw transformError(module, filepath, entry!.code);

  // the transform loader is done before its evaluation resolves (and adds) the dependencies
  const dependencies = (await state.transformer).get_evaluated_dependencies(filepath) as string[];
  for (const dependency of dependencies) ctx.addDependency(dependency);

  return module ?? "";
};

const atomicLayerOrder = "@layer theme, base, components, utilities;";
/** Same layers as the vite plugin's atomic CSS, see `rank_layered_atomic_css` for the nested ones. */
const wrapAtomicCss = (css: string) => `${atomicLayerOrder}\n@layer utilities {\n${css}\n}`;

/** Serves the CSS of the file in `?filepath=`, in atomic mode including the atomic CSS it uses. */
export const createCssLoader = <Options extends object>(getConfig: GetConfig<Options>) =>
  virtualModuleLoader(getConfig, async (ctx, config, filepath) => {
    const css = await loadVirtualModule(ctx, config, filepath, "cssFiles", `${filepath}.${cssExtension}`);
    // Turbopack has no hook to collect the atomic CSS of all files (and runs loaders in several processes),
    // every file's CSS includes the atomic CSS it uses instead, as of its latest evaluation in this process
    const atomicCss = config.atomic ? (await getState(config).transformer).get_file_atomic_css(filepath) : "";
    return [css, atomicCss && wrapAtomicCss(atomicCss)].filter(Boolean).join("\n");
  });

/** Serves the atomic class module of the file in `?filepath=`. */
export const createAtomicProgramLoader = <Options extends object>(getConfig: GetConfig<Options>) =>
  virtualModuleLoader(getConfig, (ctx, config, filepath) =>
    loadVirtualModule(ctx, config, filepath, "atomicFiles", `${filepath}.${atomicProgramExtension}`),
  );
