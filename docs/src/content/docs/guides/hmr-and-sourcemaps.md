---
title: HMR & source maps
description: Development experience features of the Vite plugin.
sidebar:
  order: 6
---

## Hot module replacement

The Vite plugin tracks which values each style depends on, across files.

```ts title="theme.ts"
export const primary = "coral";
```

```ts title="Button.tsx"
import { primary } from "./theme";

const button = css`
  background: ${primary};
`;
```

Editing `theme.ts` re-evaluates `Button.tsx` and hot-swaps its CSS, no full reload. Invalidation is
precise:

- only importers whose **used exports** changed are invalidated
- transitive chains (`a.ts` → `b.ts` → `Button.tsx`) are followed
- CSS updates are sent as CSS-only updates, component state is preserved
- in atomic mode the atomic stylesheet is updated in every environment that served it, including
  query variants like `?inline` used by SSR frameworks

## CSS source maps

Generated CSS maps back to the tagged template in your source, both in the dev server and in
builds. Enable them through Vite:

```ts title="vite.config.ts"
export default defineConfig({
  css: { devSourcemap: true }, // dev server
  build: { sourcemap: true },  // production build
});
```

Devtools will then show `Button.tsx:12` instead of a generated stylesheet.

JS source maps for the transformed modules are always produced and chained with the other plugins.
