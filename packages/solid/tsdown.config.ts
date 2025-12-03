import { defineConfig } from "tsdown";

export default defineConfig({
  dts: {
    sourcemap: true,
  },
  target: "esnext",
  format: "esm",
  entry: ["src/index.ts"],
  plugins: [],
});
