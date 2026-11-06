declare module "*.wasm" {
  const wasmModule: () => Promise<WebAssembly.Instance>;
  export default wasmModule;
}

declare var __style_this_atomic_init: boolean | undefined;
