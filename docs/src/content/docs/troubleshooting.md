---
title: Troubleshooting
description: Common errors and how to fix them.
---

## Setup

### `called 'css' at runtime. This indicates an error in the transform.`

The file wasn't transformed. Check that:

- the plugin is registered, and with Vite its [`filter`](/reference/vite/#filter) matches the file
- the file has a supported extension (JS/TS, or `.svelte` with Vite) and isn't inside
  `node_modules`

The same applies to `styled.*` and `extraClass` errors.

### `@style-this/core/atomic should not be imported directly`

The import wasn't resolved by the plugin. This typically happens during SSR when
`@style-this/core` is externalized, make sure it's not listed in `ssr.external`.

### Mismatched package versions

All `@style-this/*` packages are released together and must be on the same version.

```bash
pnpm ls -r --depth 0 | grep @style-this
```

## Evaluation

Styles run at build time, see [Build-time evaluation](/guides/evaluation/).

### `window is not defined` and similar

A style depends, directly or through an import, on code that needs a browser.

- move the value into a module without side effects
- or exclude the import with [`ignoredImports`](/guides/evaluation/#ignoring-imports)

With Vite, set [`debug: true`](/reference/vite/#debug) to see which modules get evaluated.

### `tried to access dynamic variable '<name>'`

A style interpolates a function parameter, which is only known at runtime. Use a
[styled component](/guides/styled-components/#dynamic-styles-with-styleprops) or a CSS custom
property instead.

### `circular import of '…' from '…', its values can't be used before it's evaluated`

Two modules import each other and one needs a value of the other before it's evaluated. Move the
shared values into a separate module, see [Circular imports](/guides/evaluation/#circular-imports).

### `failed to determine program type from extension '…'`

A style uses a value imported from a file that isn't JS/TS or JSON, e.g. an image. Import it with
`?raw` if you need its contents, or keep it out of styles.

### `failed to evaluate import '…', '?raw' is the only supported query`

Imports with queries like `?url` can't be evaluated at build time.

### A value shows up as `[object Promise]`

Interpolations aren't awaited. Compute the value synchronously.

## Styling

### An override doesn't apply

- **Default mode**: both classes are applied and the CSS cascade decides, see
  [Who wins in default mode](/guides/merging-styles/#who-wins-in-default-mode).
- **Atomic mode**: combine styles with [`mergeStyles`](/guides/merging-styles/) instead of string
  concatenation.

### A dynamic styled value has no effect

The function result replaces the whole `var(...)`. Return complete values including units
(`` `${size}px` ``), text after the interpolation isn't combined with it, see
[Dynamic styles](/guides/styled-components/#dynamic-styles-with-styleprops).

### Styles are missing in atomic mode

Add `import "@style-this/core/atomic"` to a module that's loaded on every page, see
[Atomic CSS](/guides/atomic-css/#enabling).

### Atomic styles are overridden by my own CSS

Atomic CSS lives in the `utilities` cascade layer, and unlayered CSS always wins against layered
CSS. Move global and reset styles into a lower layer such as `@layer base { ... }`, see
[Cascade layers](/guides/atomic-css/#cascade-layers).

## Reporting bugs

Open an issue at [github.com/shiro/style-this](https://github.com/shiro/style-this/issues) with a
minimal reproduction, ideally based on one of the
[example projects](https://github.com/shiro/style-this/tree/master/examples).
