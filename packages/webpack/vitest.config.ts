/// <reference types="vitest" />
import mainConfig from "./tsdown.config";
import { defineConfig, Plugin } from "vitest/config";

export default defineConfig({
  plugins: mainConfig.plugins as Plugin[],
});

