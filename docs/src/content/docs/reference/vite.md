---
title: "@style-this/vite"
description: Vite plugin options.
sidebar:
  order: 3
---

```ts
import styleThis, { DefaultImport, type StyleThisViteOptions } from "@style-this/vite";

styleThis(options?: StyleThisViteOptions): Plugin
```

The plugin is named `vite:style-this` and runs with `enforce: "pre"`. Its transform has `order: "pre"`, so
it runs before framework compilers (React, Solid, Svelte) wherever the plugin is listed.

## Options

### `filter`

- Type: `Filter | Filter[]` where `Filter = RegExp | ((filepath: string) => boolean)`
- Default: `[]` (every supported file)

Files to transform. A file is transformed if **any** filter matches. Regardless of the filter, only
JS/TS (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, `.cts`) and `.svelte` files outside
`node_modules` are considered.

Narrowing the filter to the files that contain styles (e.g. `/\.tsx$/`) speeds up builds.

```ts
styleThis({ filter: [/\.tsx$/, (file) => file.endsWith(".styles.ts")] });
```

### `atomic`

- Type: `boolean`
- Default: `false`

Enables [atomic CSS](/guides/atomic-css/) output, wrapped in `@layer utilities`. Requires
`import "@style-this/core/atomic"` in your app.

### `ignoredImports`

- Type: `Record<string, true | (string | typeof DefaultImport)[]>`

Imports to skip during build-time evaluation, keyed by the specifier as written in the source.
`true` ignores the whole module, an array ignores the listed imported names (aliases don't matter),
`DefaultImport` stands for the default import. See
[Ignoring imports](/guides/evaluation/#ignoring-imports).

### `cssExtension`

- Type: `string`
- Default: `"css"`

Extension of the generated virtual stylesheets (`<file>.<cssExtension>`).

### `debug`

- Type: `boolean`
- Default: `false`

Logs every transform with a `[style-this]` prefix and keeps the generated evaluation programs for
inspection.

### `useRequire`

- Type: `boolean`

Makes the generated evaluation programs load dependencies with `require` instead of dynamic
`import`. Leave unset unless you hit module loading issues with CommonJS-only dependencies.

### `cacheRegistry`

- Type: `CacheRegistry`

Advanced. Supplies the cache instance holding evaluated CSS, to share it between several plugin
instances.

## Config changes

The plugin adjusts your Vite config:

- adds `@style-this/core/compiler` to `optimizeDeps.include`
- adds `@style-this/core` to `ssr.noExternal` (unless it's `true`), so the atomic entrypoint
  resolves during SSR

## Virtual modules

| Id | Content |
| --- | --- |
| `virtual:style-this:<file>.<cssExtension>` | per-file stylesheet, e.g. `Button.tsx.css` or `Card.svelte.css` |
| `virtual:style-this:<file>.style-this.js` | class name exports (atomic mode) |
| `@style-this/core/atomic` | atomic stylesheet (layer order and `@layer utilities`) |

In atomic builds the atomic CSS is part of the stylesheet of the chunk importing `@style-this/core/atomic`
(the single bundled stylesheet without CSS code splitting, the default in library mode), at the position of
the import like in dev. It's minified and hashed like the rest of the stylesheet. Without the import the atomic
CSS is dropped with a warning.
