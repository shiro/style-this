declare module "*.wasm" {
  const wasmModule: () => Promise<WebAssembly.Instance>;
  export default wasmModule;
}

declare var __styleThis_getAtomicCss: (() => string) | undefined;
