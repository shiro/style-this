import initWasm, { initialize } from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

import {
  Transformer as _Transformer,
  SolidJsTransformer as _SolidJsTransformer,
} from "../native/pkg/style_this.js";

export interface Transformer extends Omit<_Transformer, "transform"> {
  transform(
    code: string,
    filepath: string,
  ): Promise<
    | {
        code: string;
        sourcemap: string;
      }
    | undefined
  >;
}

export interface SolidJsTransformer
  extends Omit<_SolidJsTransformer, "transform"> {
  transform(
    code: string,
    filepath: string,
  ): Promise<{
    code: string;
    sourcemap: string;
  }>;
}

// fix types on rust-generated types
export const Transformer = _Transformer as any as new (opts: {
  loadFile: (filepath: string) => Promise<[string, string]>;
  cssFileStore: Map<string, string>;
  exportCache: Record<string, Record<string, any>>;
  cssExtension: string;
}) => Transformer;
export const SolidJsTransformer =
  _SolidJsTransformer as any as new () => SolidJsTransformer;

export const initializeStyleThis = async () => {
  const instance = await (wasm as any)();
  await initWasm({ module_or_path: instance });
  initialize();
};
