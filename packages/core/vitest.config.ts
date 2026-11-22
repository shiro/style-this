/// <reference types="vitest" />
import { wasm } from "@rollup/plugin-wasm";
import { defineConfig, Plugin } from "vitest/config";

export default defineConfig({
  // before vite 8's own wasm handling, which hands plugin-wasm JS instead of the binary otherwise
  plugins: [{ ...wasm({ maxFileSize: 10000000 }), enforce: "pre" }] as Plugin[],
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
