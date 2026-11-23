---
title: Changelog
description: Release notes for all style-this packages.
sidebar:
  order: 1
---

All `@style-this/*` packages are released in lockstep since 0.2.0. Use the version picker in the
header to read the docs of an older release.

## 0.6.1

### Fixes

- Fix the Vite dev server failing to transform client modules that import optimized deps
  (`'?raw' is the only supported query`)
- In atomic mode, drop longhands followed by their shorthand (e.g. `margin-bottom` before a
  `margin` class passed through `className`) in `mergeStyles` and within a style, so the shorthand
  wins like in default mode
- Don't atomize `!important` declarations, a layered one beat the `!important` overrides of nested
  rules like `&.active`

## 0.6.0

### Features

- Add `StyleThisPlugin` to `@style-this/webpack`, a working webpack 5 plugin with `atomic` and
  `useRequire` options
- Support atomic mode in Next.js (`ATOMIC=1`), every file's stylesheet includes the atomic CSS it
  uses
- Transform `.ts`, `.jsx`, `.js` and `.mjs` files under Turbopack, not only `.tsx`
- Evaluate JSON imports (default and named top-level keys) and `?raw` imports at build time
- Follow export lists, re-exports and `export *` / `export * as ns` barrel files during evaluation
- Allow circular imports, values that aren't evaluated yet fail with a descriptive error
- Transform both the instance and the module `<script>` of Svelte components, keeping their
  attributes, and map their source maps to the `.svelte` file
- Forward `ref` in React styled components (React 18 included)
- Accept CSS string `style` props in Solid styled components
- Atomize dynamic styled declarations (`var(...)`), so `mergeStyles` and `className` overrides
  apply to them
- Pass JS source maps from the webpack and Next.js loaders
- Add the `resolveVirtualImport` compiler option

### Fixes

- Fix the Next.js integration, which failed to resolve the generated CSS imports
- Update the CSS of importers when a dependency changes in Next.js and webpack
- Rewrite `css` inside exported functions and classes, and include declarations used above their
  position
- Start atomic class hashes with an uppercase letter, so `mergeStyles` no longer de-duplicates
  hand-written classes like `bg-light` and `bg-white`
- Keep CSS escapes like `\2014` intact
- Replace `$` in generated class names
- Keep data URLs and escaped strings intact when splitting atomic declarations
- Prefix the locals of generated styled components, so style functions can reference variables
  like `props`
- Fix HMR hangs and stale CSS: files gaining styles, edits during evaluation, Svelte files and
  syntax errors
- Fix CSS source map positions after non-ASCII text and JS source maps being one line off
- Detect `node_modules` and escape file paths on Windows

### Breaking changes

- Remove the `wrapSelectorsWithGlobal` compiler option
- Remove the default loader and `NextCSSLoader` exports of `@style-this/webpack`, use
  `new StyleThisPlugin()` instead
- `@style-this/next` requires `next >=16.2`, now a peer dependency
- `ignoredImports` matches the imported name instead of the local one, so aliased and default
  imports are now ignored too
- Interpolating a style into a selector (`.${style} {}`) no longer includes its `extraClass`
  classes, add them to the selector if needed

## 0.5.0

- Wrap atomic CSS in `@layer utilities` after a default `@layer theme, base, components, utilities;`
  order, so dev and build share the same cascade. Override the order by declaring your own `@layer`
  statement before `@style-this/core/atomic` is imported. Unlayered CSS (including non-atomic
  component CSS) now takes precedence over atomic CSS, see
  [Cascade layers](/guides/atomic-css/#cascade-layers)

## 0.4.0

- Append the atomic CSS to the stylesheet of the chunk importing `@style-this/core/atomic` in
  builds, instead of the first stylesheet in the bundle
- Invalidate query variants of the atomic entrypoint (e.g. `?inline`) on atomic CSS changes during
  HMR

## 0.3.0

- Only invalidate importers whose used exports changed on HMR, instead of every importer
- Don't mark importers of reloaded virtual modules as updated during HMR
- Report evaluation errors in imported modules instead of crashing
- Extract CSS of styled components in files without a `css` import
- Don't externalize `@style-this/core` during SSR in the vite plugin
- Fix class references in selectors in atomic mode
- Fix multi-line declarations leaving invalid CSS in atomic mode
- Keep the closing brace of trailing nested rules in atomic mode
- Ignore comments when splitting CSS into declarations
- Tolerate invalidated store entries when resolving evaluated CSS
- Pass the CSS cache to the compiler in the Next.js loaders
- Fix TypeScript type errors in core, vite and webpack packages

## 0.2.1

- Fix `@style-this/core/cssSourceMap` and `@style-this/core/atomic` exporting TypeScript sources,
  which broke installs from npm
- Only transform JS/TS and Svelte files in the vite plugin, fixes builds with extension-less
  virtual modules (e.g. vinxi)

## 0.2.0

- Add atomic CSS mode, including `mergeStyles` support, non-atomic styles in atomic mode and atomic
  sourcemap markers
- Add CSS source maps pointing to original source files (build and Vite dev server)
- Add cross-file HMR for imported value changes with dependency tracking and invalidation
- Rework cache registry and fix race conditions
- Rework styled components; add `extraClass` support and fix trailing whitespace
- Add React styled components (`@style-this/react`)
- Add Next.js support via webpack, including turbopack fixes
- Add Svelte support
- Map errors from the dynamic eval module back to source
- Stop emitting empty CSS files
- Improve debug logging
- Make styled component CSS variable names and atomic-mode chunk hashes independent of the absolute
  project path

## 0.1.x

- **0.1.4**: Add async compilation
- **0.1.3**: Compiler improvements
- **0.1.2**: Improve default export handling in compiler
- **0.1.1**: Make CSS order deterministic
- **0.1.0**: Initial beta release

Per-package changelogs live next to each package, e.g.
[`packages/core/CHANGELOG.md`](https://github.com/shiro/style-this/blob/master/packages/core/CHANGELOG.md).
