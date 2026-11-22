---
title: Other frameworks
description: Use style-this with any framework, without styled components.
sidebar:
  order: 6
---

`css` produces a plain class name string, so it works with anything that lets you set a class:
Preact, Vue JSX, Lit, vanilla TypeScript, ... Use the [Vite plugin](/reference/vite/) or the
[webpack plugin](/frameworks/webpack/).

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

Only JS/TS files are transformed, plus `.svelte` files with the Vite plugin. Files in
`node_modules` are never transformed.

What you don't get outside React and Solid is `styled`. Use custom properties for dynamic values:

```ts
const bar = css`
  width: var(--progress);
`;

el.style.setProperty("--progress", "40%");
```
