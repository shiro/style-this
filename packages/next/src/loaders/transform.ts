import type { RawLoaderDefinitionFunction } from "webpack";
import { initializeStyleThis, Transformer, type CssCachEntry } from "@style-this/core/compiler";
import { createRequire } from "node:module";
import { cacheRegistry, cssFiles } from "../shared";
import { makeLoadFile } from "./shared";
import { resolveVirtualImport } from "./consts";

type LoaderCtx = ThisParameterType<RawLoaderDefinitionFunction>;
export type Bundler = "webpack" | "turbopack";

export const cssExtension = "css";
const mocks = new Map<string, string>();
const transformers = new Map<Bundler, Promise<Transformer>>();

const getTransformer = (bundler: Bundler, loadFile: ReturnType<typeof makeLoadFile>) => {
  let transformer = transformers.get(bundler);
  if (!transformer) {
    // needs a loader for the per-file atomic class modules and a way to collect the atomic CSS of
    // all files (Turbopack has no hook to run after all modules are transformed)
    if (process.env.ATOMIC === "1") throw new Error("@style-this/next doesn't support atomic mode yet");

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
        }),
    );
    transformers.set(bundler, transformer);
  }
  return transformer;
};

/** Transforms `code`, its CSS is stored in `cssFiles` under `<filepath>.css` for the CSS loader. */
export const transformFile = async (
  ctx: LoaderCtx,
  bundler: Bundler,
  code: string,
  filepath: string,
) => {
  const loadFile = makeLoadFile(ctx, mocks);
  const transformer = await getTransformer(bundler, loadFile);

  const cssFilepath = `${filepath}.${cssExtension}`;
  const skipCssEval = cssFiles.get(cssFilepath)?.code === code;

  if (!skipCssEval) {
    let resolve: CssCachEntry["resolve"] | undefined;
    const entry = new Promise((_resolve) => {
      resolve = (css: string | Error) => _resolve(css);
    }) as CssCachEntry;
    entry.resolve = resolve!;
    entry.code = code;

    // resolved by the compiler through `cacheRegistry`
    cssFiles.set(cssFilepath, entry);
  }

  try {
    return await transformer.transform(code, filepath, skipCssEval, loadFile);
  } catch (err) {
    // the compiler resolves the stored CSS entry with the error, drop it or later transforms would
    // skip CSS evaluation and keep serving the error
    cssFiles.delete(cssFilepath);
    throw err;
  }
};
