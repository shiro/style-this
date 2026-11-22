import type { RawLoaderDefinitionFunction } from "webpack";
import {
  initializeStyleThis,
  Transformer,
  type CssCachEntry,
  type VirtualImportKind,
} from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { createRequire } from "node:module";
import { atomicFiles, cacheRegistry, cssFiles } from "../shared";
import { chainSourceMap, makeLoadFile } from "./shared";

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;

export type LoaderConfig = {
  /** Loaders with the same `key` share a transformer, it's created with the config of the first one. */
  key: string;
  atomic: boolean;
  resolveVirtualImport: (kind: VirtualImportKind, filepath: string) => string;
  useRequire?: boolean;
};

/** The config of a loader, from its options. */
type GetConfig<Options> = (options: Options) => LoaderConfig;

export const cssExtension = "css";
export const atomicProgramExtension = "style-this.js";
const transformers = new Map<string, Promise<Transformer>>();

const getTransformer = (config: LoaderConfig, loadFile: ReturnType<typeof makeLoadFile>) => {
  let transformer = transformers.get(config.key);
  if (!transformer) {
    transformer = initializeStyleThis().then(
      () =>
        new Transformer({
          cwd: process.cwd(),
          ignoredImports: {},
          loadFile,
          resolveVirtualImport: config.resolveVirtualImport,
          createRequire: createRequire(import.meta.url),
          cacheRegistry,
          cssExtension,
          useRequire: config.useRequire,
          atomic: config.atomic,
        }),
    );
    transformers.set(config.key, transformer);
  }
  return transformer;
};

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
const refreshDependencies = async (ctx: LoaderCtx, transformer: Transformer, filepath: string) => {
  const dependencies = transformer.get_evaluated_dependencies(filepath) as string[];

  await Promise.all(
    dependencies.map(async (dependency) => {
      // skipped evaluations don't resolve (and add) the dependencies
      ctx.addDependency(dependency);
      const code = await readFile(dependency, "utf-8").catch(() => undefined);
      for (const importer of transformer.invalidate_file(dependency, code) as string[]) {
        cssFiles.delete(`${importer}.${cssExtension}`);
        atomicFiles.delete(`${importer}.${atomicProgramExtension}`);
      }
    }),
  );
};

/**
 * Transforms `code`, its CSS is stored in `cssFiles` under `<filepath>.css` and in atomic mode its
 * class module in `atomicFiles` under `<filepath>.style-this.js`, for the virtual module loaders.
 */
const transformFile = async (ctx: LoaderCtx, config: LoaderConfig, code: string, filepath: string) => {
  const loadFile = makeLoadFile(ctx);
  const transformer = await getTransformer(config, loadFile);
  await refreshDependencies(ctx, transformer, filepath);

  const cssFilepath = `${filepath}.${cssExtension}`;
  const atomicProgramFilepath = `${filepath}.${atomicProgramExtension}`;
  const skipCssEval =
    cssFiles.get(cssFilepath)?.code === code &&
    (!config.atomic || atomicFiles.get(atomicProgramFilepath)?.code === code);

  // resolved by the compiler through `cacheRegistry`
  if (!skipCssEval) {
    cssFiles.set(cssFilepath, createEntry(code));
    if (config.atomic) atomicFiles.set(atomicProgramFilepath, createEntry(code));
  }

  try {
    return await transformer.transform(code, filepath, skipCssEval, loadFile);
  } catch (err) {
    // the compiler resolves the stored entries with the error, drop them or later transforms would
    // skip CSS evaluation and keep serving the error
    cssFiles.delete(cssFilepath);
    atomicFiles.delete(atomicProgramFilepath);
    throw err;
  }
};

/** Transforms the JS/TS modules, their virtual modules are imported from the noop files with `?filepath=`. */
export const createTransformLoader =
  <Options extends object>(getConfig: GetConfig<Options>): RawLoaderDefinitionFunction<Options> =>
  function (code, inputSourceMap) {
    const callback = this.async();
    // TODO remove this when done
    this.cacheable(false);

    transformFile(this, getConfig(this.getOptions()), code.toString(), this.resourcePath).then(
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
    // TODO remove this when done
    this.cacheable(false);

    // the loader rules only match imports with `?filepath=`
    const filepath = new URLSearchParams(this.resourceQuery).get("filepath")!;

    load(this, getConfig(this.getOptions()), filepath).then(
      (code) => callback(null, code),
      (err) => callback(err),
    );
  };

/**
 * Loads the virtual module of `filepath` stored in `store` under `key`. Turbopack runs loaders in a
 * pool of processes, so the file may have been transformed in another process, it's transformed
 * again if this process has no (or an outdated) module for it.
 */
const loadVirtualModule = async (
  ctx: LoaderCtx,
  config: LoaderConfig,
  filepath: string,
  store: Map<string, CssCachEntry>,
  key: string,
) => {
  ctx.addDependency(filepath);
  const code = await readFile(filepath, "utf-8").catch(() => undefined);

  // the module is outdated if dependencies changed, even though `filepath` didn't
  const transformer = await transformers.get(config.key);
  if (transformer) await refreshDependencies(ctx, transformer, filepath);

  if (code !== undefined && store.get(key)?.code !== code) {
    if (!(await transformFile(ctx, config, code, filepath))) return "";
  }

  const module = await store.get(key);
  if (module instanceof Error) throw module;

  // the transform loader is done before its evaluation resolves (and adds) the dependencies
  const dependencies = (await transformers.get(config.key))?.get_evaluated_dependencies(filepath) ?? [];
  for (const dependency of dependencies as string[]) ctx.addDependency(dependency);

  return module ?? "";
};

const atomicLayerOrder = "@layer theme, base, components, utilities;";
/** Same layers as the vite plugin's atomic CSS, see `rank_layered_atomic_css` for the nested ones. */
const wrapAtomicCss = (css: string) => `${atomicLayerOrder}\n@layer utilities {\n${css}\n}`;

/** Serves the CSS of the file in `?filepath=`, in atomic mode including the atomic CSS it uses. */
export const createCssLoader = <Options extends object>(getConfig: GetConfig<Options>) =>
  virtualModuleLoader(getConfig, async (ctx, config, filepath) => {
    const css = await loadVirtualModule(ctx, config, filepath, cssFiles, `${filepath}.${cssExtension}`);
    // Turbopack has no hook to collect the atomic CSS of all files (and runs loaders in several processes),
    // every file's CSS includes the atomic CSS it uses instead, as of its latest evaluation in this process
    const atomicCss = config.atomic
      ? (await transformers.get(config.key))?.get_file_atomic_css(filepath)
      : "";
    return [css, atomicCss && wrapAtomicCss(atomicCss)].filter(Boolean).join("\n");
  });

/** Serves the atomic class module of the file in `?filepath=`. */
export const createAtomicProgramLoader = <Options extends object>(getConfig: GetConfig<Options>) =>
  virtualModuleLoader(getConfig, (ctx, config, filepath) =>
    loadVirtualModule(ctx, config, filepath, atomicFiles, `${filepath}.${atomicProgramExtension}`),
  );
