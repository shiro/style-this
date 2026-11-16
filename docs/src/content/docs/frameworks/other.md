---
title: Other frameworks
description: Use style-this with any Vite based setup.
sidebar:
  order: 5
---

`css` produces a plain class name string, so it works with anything that runs on Vite and lets you
set a class: Preact, Vue JSX, Lit, vanilla TypeScript, ...

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [styleThis()],
});
```

```ts title="src/main.ts"
import { css, mergeStyles } from "@style-this/core";

const button = css`
  padding: 8px 16px;
  border-radius: 4px;
`;

const primary = css`
  background: royalblue;
  color: white;
`;

const el = document.createElement("button");
el.className = mergeStyles(button, primary);
```

Only JS/TS files (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, `.cts`) and `.svelte` files
are transformed. Files in `node_modules` are never transformed.

What you don't get outside React and Solid is `styled`. Use custom properties for dynamic values:

```ts
const bar = css`
  width: var(--progress);
`;

el.style.setProperty("--progress", "40%");
```
