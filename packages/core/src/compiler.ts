import initWasm, { initialize } from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

import { Transformer as _Transformer, CacheRegistry as _CacheRegistry } from "../native/pkg/style_this.js";

/**
 * JS side cache the compiler resolves CSS and atomic modules into, `initializeRefs` must store the
 * CSS and atomic `Map`s on `globalThis` under the given names.
 */
export interface JsCacheRegistry {
  initializeRefs(cssRef: string, atomicRef: string): void;
}

export interface CacheRegistry {
  css_cache_ref(): string;
  atomic_cache_ref(): string;
  value_cache_ref(): string;
  invalidateModule(filepath: string): void;
}

export interface Transformer extends Omit<_Transformer, "transform"> {
  transform(
    code: string,
    filepath: string,
    skipCssEval: boolean,
    loadFile?: (id: string, importer: string) => Promise<[string, string]>,
  ): Promise<
    | {
      code: string;
      sourcemap: string;
    }
    | undefined
  >;
}

export type CssSourceMapData = Array<{
  className: string;
  start: number;
  end: number;
}>;

export type CssCachEntry = Promise<string | Error> & {
  resolve: (
    value: string | Error,
    sourcemapData?: CssSourceMapData,
    filepath?: string,
  ) => void;
  code: string;
};

// fix types on rust-generated types
export const Transformer = _Transformer as unknown as new (opts: {
  cwd: string;
  ignoredImports: Record<string, string[]>;

  loadFile: (filepath: string, importer: string) => Promise<[string, string]>;
  createRequire?: (filename: string) => NodeRequire;

  cacheRegistry?: JsCacheRegistry;

  wrapSelectorsWithGlobal?: boolean;

  cssExtension: string;
  useRequire?: boolean;
  debug?: boolean;
  atomic?: boolean;
  onDebugVirtualModule?: (name: string, code: string) => void;
}) => Transformer;

export const CacheRegistry = _CacheRegistry as unknown as new () => CacheRegistry;

export const initializeStyleThis = async () => {
  const instance = await (wasm as unknown as () => Promise<WebAssembly.Instance>)();
  await initWasm({ module_or_path: instance });
  initialize();
};
