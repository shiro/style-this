import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis, Transformer, type CssCachEntry } from "@style-this/core/compiler";
import { readFile } from "fs/promises";
import { createRequire } from "node:module";
import { atomicFiles, cacheRegistry, cssFiles } from "../shared";
import { makeLoadFile } from "./shared";
import { atomic, resolveVirtualImport, wrapAtomicCss } from "./consts";

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;
export type Bundler = "webpack" | "turbopack";

export const cssExtension = "css";
export const atomicProgramExtension = "style-this.js";
const transformers = new Map<Bundler, Promise<Transformer>>();

const getTransformer = (bundler: Bundler, loadFile: ReturnType<typeof makeLoadFile>) => {
  let transformer = transformers.get(bundler);
  if (!transformer) {
    transformer = initializeStyleThis().then(
      () =>
        new Transformer({
          cwd: process.cwd(),
          ignoredImports: {},
          loadFile,
          resolveVirtualImport,
          createRequire: createRequire(import.meta.url),
          cacheRegistry,
          cssExtension,
          useRequire: bundler === "turbopack",
          atomic,
        }),
    );
    transformers.set(bundler, transformer);
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
 * Transforms `code`, its CSS is stored in `cssFiles` under `<filepath>.css` and in atomic mode its
 * class module in `atomicFiles` under `<filepath>.style-this.js`, for the virtual module loaders.
 */
export const transformFile = async (
  ctx: LoaderCtx,
  bundler: Bundler,
  code: string,
  filepath: string,
) => {
  const loadFile = makeLoadFile(ctx);
  const transformer = await getTransformer(bundler, loadFile);

  const cssFilepath = `${filepath}.${cssExtension}`;
  const atomicProgramFilepath = `${filepath}.${atomicProgramExtension}`;
  const skipCssEval =
    cssFiles.get(cssFilepath)?.code === code &&
    (!atomic || atomicFiles.get(atomicProgramFilepath)?.code === code);

  // resolved by the compiler through `cacheRegistry`
  if (!skipCssEval) {
    cssFiles.set(cssFilepath, createEntry(code));
    if (atomic) atomicFiles.set(atomicProgramFilepath, createEntry(code));
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

/** A loader serving a virtual module of the file in `?filepath=`, see `loadVirtualModule`. */
export const virtualModuleLoader =
  (
    load: (ctx: LoaderCtx, bundler: Bundler, filepath: string) => Promise<string>,
  ): RawLoaderDefinitionFunction<{ bundler?: Bundler }> =>
  function () {
    const callback = this.async();
    // TODO remove this when done
    this.cacheable(false);

    const bundler = this.getOptions().bundler ?? "webpack";
    // the loader rules only match imports with `?filepath=`
    const filepath = new URLSearchParams(this.resourceQuery).get("filepath")!;

    load(this, bundler, filepath).then(
      (code) => callback(null, code),
      (err) => callback(err),
    );
  };

/**
 * Loads the virtual module of `filepath` stored in `store` under `key`. Turbopack runs loaders in a
 * pool of processes, so the file may have been transformed in another process, it's transformed
 * again if this process has no (or an outdated) module for it.
 */
export const loadVirtualModule = async (
  ctx: LoaderCtx,
  bundler: Bundler,
  filepath: string,
  store: Map<string, CssCachEntry>,
  key: string,
) => {
  ctx.addDependency(filepath);
  const code = await readFile(filepath, "utf-8").catch(() => undefined);

  if (code !== undefined && store.get(key)?.code !== code) {
    if (!(await transformFile(ctx, bundler, code, filepath))) return "";
  }

  const module = await store.get(key);
  if (module instanceof Error) throw module;
  return module ?? "";
};

/** Atomic CSS of the declarations `filepath` uses, as of its latest evaluation in this process. */
export const fileAtomicCss = async (bundler: Bundler, filepath: string) => {
  const css = (await transformers.get(bundler))?.get_file_atomic_css(filepath);
  return css ? wrapAtomicCss(css) : "";
};
