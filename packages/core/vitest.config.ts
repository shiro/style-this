/// <reference types="vitest" />
import { wasm } from "@rollup/plugin-wasm";
import { defineConfig, Plugin } from "vitest/config";

export default defineConfig({
  plugins: [wasm({ maxFileSize: 10000000 })] as Plugin[],
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
