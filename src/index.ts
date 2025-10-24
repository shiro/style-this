import initWasm from "../native/pkg/style_this.js";
import wasm from "../native/pkg/style_this_bg.wasm";

export { initialize } from "../native/pkg/style_this.js";

export const css = (..._raw: any): string => {
  throw new Error(
    "vite:stylistic: called 'css' at runtime. This indicates an error in the transform.",
  );
};

export const init = async () => {
  const instance = await (wasm as any)();
  await initWasm({ module_or_path: instance });
};
