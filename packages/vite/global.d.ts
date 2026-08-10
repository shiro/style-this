declare module "*.wasm" {
  const wasmModule: () => Promise<WebAssembly.Instance>;
  export default wasmModule;
}

declare global {
  var __styleThis_getAtomicCss: (((...args: unknown[]) => string) & { isAtomicMode?: boolean }) | undefined;
}
