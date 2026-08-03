import initWasm, { initialize, css_to_atomic_class_list, get_atomic_css, clear_atomic_css_cache } from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

import { Transformer as _Transformer } from "../native/pkg/style_this.js";

// Re-export atomic CSS functions
export { css_to_atomic_class_list, get_atomic_css, clear_atomic_css_cache };

export interface Transformer extends Omit<_Transformer, "transform"> {
  transform(
    code: string,
    filepath: string,
    skipCssEval: boolean,
    importSource?: string,
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
export const Transformer = _Transformer as any as new (opts: {
  cwd: string;
  ignoredImports: Record<string, string[]>;

  loadFile: (filepath: string, importer: string) => Promise<[string, string]>;
  createRequire?: (filename: string) => NodeRequire;

  cssCache: Map<string, CssCachEntry>;
  valueCache: Record<string, Record<string, any>>;

  wrapSelectorsWithGlobal?: boolean;

  cssExtension: string;
  useRequire?: boolean;
  debug?: boolean;
  atomic?: boolean;
}) => Transformer;

export const initializeStyleThis = async () => {
  const instance = await (wasm as any)();
  await initWasm({ module_or_path: instance });
  initialize();
};
