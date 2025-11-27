import { defineConfig } from "tsdown";
import { wasm } from "@rollup/plugin-wasm";

export default defineConfig([
  {
    dts: {
      sourcemap: true,
    },
    target: "esnext",
    format: "esm",
    entry: [
      "src/index.ts",
      "src/loaders/webpackCssLoader.ts",
      "src/loaders/webpackTransformLoader.ts",
      "src/loaders/turbopackTransformLoader.ts",
    ],
    plugins: [wasm({ maxFileSize: 10000000 })],
  },
]);
