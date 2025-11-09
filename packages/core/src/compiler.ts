import initWasm from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

export { initialize, Transformer } from "../native/pkg/style_this.js";

export const initializeStyleThisCompiler = async () => {
  const instance = await (wasm as any)();
  await initWasm({ module_or_path: instance });
};
