# @style-this/vite

Vite plugin for [style-this](https://style-this.usagi.io), zero-runtime CSS-in-JS. Works with plain Vite, SolidStart and
SvelteKit.

```bash
pnpm add @style-this/core
pnpm add -D @style-this/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [styleThis({ filter: /\.tsx$/ })],
});
```

Documentation: [style-this.usagi.io/reference/vite/](https://style-this.usagi.io/reference/vite/)
