declare module "*.wasm" {
  const wasmModule: () => Promise<WebAssembly.Instance>;
  export default wasmModule;
}

import type { CssCachEntry } from "@style-this/core/compiler";

declare global {
  var __styleThis_cssCache: Map<string, CssCachEntry> | undefined;
  var __styleThis_valueCache: Record<string, Record<string, any>> | undefined;
  var __styleThis_temporaryPrograms: Record<string, string>;
}
