import initWasm, { initialize } from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

import { Transformer as _Transformer } from "../native/pkg/style_this.js";

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

export type CssCachEntry = Promise<string | Error> & {
  resolve: (value: string | Error) => void;
  code: string;
};

// fix types on rust-generated types
export const Transformer = _Transformer as any as new (opts: {
  cwd: string;
  ignoredImports: Record<string, string[]>;

  loadFile: (filepath: string, importer: string) => Promise<[string, string]>;

  cssCache: Map<string, CssCachEntry>;
  valueCache: Record<string, Record<string, any>>;

  wrapSelectorsWithGlobal?: boolean;

  cssExtension: string;
  useRequire?: boolean;
  debug?: boolean;
}) => Transformer;

export const initializeStyleThis = async () => {
  const instance = await (wasm as any)();
  await initWasm({ module_or_path: instance });
  initialize();
};
