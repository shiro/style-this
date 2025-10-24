import { defineConfig } from "tsdown";
import { wasm } from "@rollup/plugin-wasm";

export default defineConfig({
  dts: {
    sourcemap: true,
  },
  // target: "node18",
  // target: "node16",
  target: "esnext",
  // format: "es",
  format: "cjs",
  entry: ["src/index.ts", "src/vite.ts"],
  plugins: [
    wasm({
      maxFileSize: 10000000,
      //
    }),
  ],
});
