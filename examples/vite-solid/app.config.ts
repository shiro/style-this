import { defineConfig } from "@solidjs/start/config";
import path from "node:path";
import tsconfig from "./tsconfig.json";

import styleThisVitePlugin from "@style-this/vite";

const babelPluginLabels = [
  "solid-labels/babel",
  { dev: process.env.NODE_ENV == "development" },
];

export default defineConfig({
  devOverlay: false,
  server: {
    baseURL: process.env.BASE_PATH,
  },

  solid: {
    babel: {
      plugins: [babelPluginLabels],
    },
    // the `solid` field is incorrectly typed
    ...({} as any),
  },

  vite(options) {
    return {
      // css: { postcss: "./postcss.config.js" },
      server: {
        port: 3000,
        warmup: { clientFiles: ["./src/app.tsx"] },
      },
      build: { sourcemap: true },
      resolve: {
        alias: Object.fromEntries(
          Object.entries(tsconfig.compilerOptions.paths).map(([key, value]) => [
            key.replace(/\/\*$/, ""),
            path.join(process.cwd(), value[0].replace(/\/\*$/, "")),
          ]),
        ),
      },
      css: { transformer: "lightningcss" },
      plugins: [styleThisVitePlugin({ filter: /.*\.tsx/ })],
    };
  },
});
