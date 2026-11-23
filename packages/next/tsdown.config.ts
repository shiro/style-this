import { defineConfig } from "tsdown";

export default defineConfig([
  {
    dts: {
      sourcemap: true,
    },
    target: "esnext",
    format: "esm",
    entry: [
      "src/index.ts",
      "src/loaders/cssLoader.ts",
      "src/loaders/atomicProgramLoader.ts",
      "src/loaders/transformLoader.ts",
    ],
  },
]);
