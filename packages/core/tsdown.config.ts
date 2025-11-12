import { defineConfig } from "tsdown";
import { wasm } from "@rollup/plugin-wasm";

export default defineConfig([
  {
    dts: { sourcemap: true },
    target: "esnext",
    format: "es",
    entry: ["src/index.ts"],
  },
  {
    dts: { sourcemap: true },
    target: "esnext",
    format: "cjs",
    entry: ["src/compiler.ts"],
    plugins: [wasm({ maxFileSize: 10000000 })],
  },
]);
