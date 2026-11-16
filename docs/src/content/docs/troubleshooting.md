---
title: Troubleshooting
description: Common errors and how to fix them.
---

## `called 'css' at runtime. This indicates an error in the transform.`

The file wasn't transformed. Check that:

- the plugin is registered and its [`filter`](/reference/vite/#filter) matches the file
- the file has a supported extension (JS/TS or `.svelte`) and isn't inside `node_modules`
- with Next.js on turbopack, the file is a `.tsx` file
- the style is assigned to a top-level variable

The same applies to `styled.*` and `extraClass` errors.

## `@style-this/core/atomic should not be imported directly`

The import wasn't resolved by the plugin. This typically happens during SSR when
`@style-this/core` is externalized, make sure it's not listed in `ssr.external`.

## Styles are missing in atomic mode

Add `import "@style-this/core/atomic"` to a module that's loaded on every page, see
[Atomic CSS](/guides/atomic-css/#enabling).

## Evaluation errors

Styles run at build time. An error like `window is not defined` means a style depends, directly or
through an import, on code that needs a browser.

- move the value into a module without side effects
- or exclude the import with [`ignoredImports`](/guides/evaluation/#ignoring-imports)

Set [`debug: true`](/reference/vite/#debug) to see which modules get evaluated.

## An override doesn't apply

In default mode both classes are applied and the CSS cascade decides. Either switch to
[atomic mode](/guides/atomic-css/) and use `mergeStyles`, or increase specificity with a nested
selector (`&&  { ... }`).

## Mismatched package versions

All `@style-this/*` packages are released together and must be on the same version.

```bash
pnpm ls -r --depth 0 | grep @style-this
```

## Reporting bugs

Open an issue at [github.com/shiro/style-this](https://github.com/shiro/style-this/issues) with a
minimal reproduction, ideally based on one of the
[example projects](https://github.com/shiro/style-this/tree/master/examples).
