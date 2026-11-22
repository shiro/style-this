---
title: HMR & source maps
description: How styles update during development and how generated code maps back to your source.
sidebar:
  order: 6
---

## Hot module replacement

style-this tracks which values each style depends on, across files.

```ts title="theme.ts"
export const primary = "coral";
```

```ts title="Button.tsx"
import { primary } from "./theme";

const button = css`
  background: ${primary};
`;
```

Editing `theme.ts` re-evaluates `Button.tsx` and updates its CSS. Dependencies are tracked through
transitive imports (`a.ts` → `b.ts` → `Button.tsx`), re-exports and barrel files, JSON files and
`?raw` imports. Files that gain or lose styles while the dev server runs are picked up too.

### Vite

The Vite plugin invalidates precisely:

- only importers whose **used exports** changed are invalidated
- CSS updates are sent as CSS-only updates, component state is preserved
- in [atomic mode](/guides/atomic-css/) the atomic stylesheet is updated in every environment that
  served it, including query variants like `?inline` used by SSR frameworks
- Svelte components are tracked like any other module

### webpack and Next.js

The loaders aren't told which files changed. Before a file's CSS is served, they check the files it
was evaluated from and re-evaluate it if any of them changed. They're registered as loader
dependencies, so editing a dependency rebuilds the affected stylesheets through the bundler's
regular HMR.

## Source maps

| | Vite | webpack | Next.js |
| --- | --- | --- | --- |
| JS | yes | yes | yes |
| CSS | yes | no | no |

**JS source maps** for transformed modules are always produced and chained with the source maps
of the loaders and plugins running before, so they point to your original source.

**CSS source maps** map generated rules back to the tagged template in your source, both in the
dev server and in builds. Enable them through Vite:

```ts title="vite.config.ts"
export default defineConfig({
  css: { devSourcemap: true }, // dev server
  build: { sourcemap: true },  // production build
});
```

Devtools then show `Button.tsx:12` instead of a generated stylesheet. For Svelte components, both
JS and CSS source maps point to the `.svelte` file.
