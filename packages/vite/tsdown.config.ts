import { defineConfig } from "tsdown";
import { wasm } from "@rollup/plugin-wasm";

export default defineConfig({
  dts: {
    sourcemap: true,
  },
  target: "esnext",
  format: "esm",
  entry: ["src/index.ts", "src/solid-js.ts"],
  plugins: [wasm({ maxFileSize: 10000000 })],
});
