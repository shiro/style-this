declare module "*.wasm" {
  const wasmModule: () => Promise<WebAssembly.Instance>;
  export default wasmModule;
}
