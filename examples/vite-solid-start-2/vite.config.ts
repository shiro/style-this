import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

import { solidStart } from "@solidjs/start/config";
import styleThisVitePlugin from "@style-this/vite";

export default defineConfig({
  plugins: [
    styleThisVitePlugin({ filter: /.*\.tsx/ }),
    solidStart(),
    nitro(),
  ],
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
