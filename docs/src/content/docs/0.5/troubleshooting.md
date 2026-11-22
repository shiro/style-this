---
title: Troubleshooting
description: Common errors and how to fix them.
slug: 0.5/troubleshooting
---

## `called 'css' at runtime. This indicates an error in the transform.`

The file wasn't transformed. Check that:

* the plugin is registered and its [`filter`](/0.5/reference/vite/#filter) matches the file
* the file has a supported extension (JS/TS or `.svelte`) and isn't inside `node_modules`
* with Next.js on turbopack, the file is a `.tsx` file
* the style is assigned to a top-level variable

The same applies to `styled.*` and `extraClass` errors.

## `@style-this/core/atomic should not be imported directly`

The import wasn't resolved by the plugin. This typically happens during SSR when
`@style-this/core` is externalized, make sure it's not listed in `ssr.external`.

## Styles are missing in atomic mode

Add `import "@style-this/core/atomic"` to a module that's loaded on every page, see
[Atomic CSS](/0.5/guides/atomic-css/#enabling).

## Evaluation errors

Styles run at build time. An error like `window is not defined` means a style depends, directly or
through an import, on code that needs a browser.

* move the value into a module without side effects
* or exclude the import with [`ignoredImports`](/0.5/guides/evaluation/#ignoring-imports)

Set [`debug: true`](/0.5/reference/vite/#debug) to see which modules get evaluated.

## An override doesn't apply

* **Default mode**: both classes are applied and the CSS cascade decides, see
  [Who wins in default mode](/0.5/guides/merging-styles/#who-wins-in-default-mode).
* **Atomic mode**: combine styles with [`mergeStyles`](/0.5/guides/merging-styles/) instead of string
  concatenation.

## Atomic styles are overridden by my own CSS

Atomic CSS lives in the `utilities` cascade layer, and unlayered CSS always wins against layered
CSS. Move global and reset styles into a lower layer such as `@layer base { ... }`, see
[Cascade layers](/0.5/guides/atomic-css/#cascade-layers).

## Mismatched package versions

All `@style-this/*` packages are released together and must be on the same version.

```bash
pnpm ls -r --depth 0 | grep @style-this
```

## Reporting bugs

Open an issue at [github.com/shiro/style-this](https://github.com/shiro/style-this/issues) with a
minimal reproduction, ideally based on one of the
[example projects](https://github.com/shiro/style-this/tree/master/examples).
