# Changelog

## 0.6.1

### Patch Changes

- Lockstep release of all packages.
  - Fix the Vite dev server failing to transform client modules that import optimized deps (`'?raw' is the only supported query`)
  - Atomic mode: drop longhands followed by their shorthand in `mergeStyles` and within a style, so the shorthand wins like in default mode
  - Atomic mode: don't atomize `!important` declarations, a layered one beat the `!important` overrides of nested rules

## 0.6.0

### Minor Changes

- Lockstep release of all packages.
  - Support atomic mode in the Next plugin, and fix the Next and webpack plugins (shared loaders, sourcemaps, error reporting, Turbopack rule for all script extensions, CSS invalidation of changed dependencies, location-independent webpack module ids)
  - Make `next` a peer dependency of `@style-this/next`, and point the next and webpack package types at the built `.d.mts`
  - Remove the `wrapSelectorsWithGlobal` transformer option
  - Add a `resolveVirtualImport` transformer option
  - Svelte: transform both scripts and keep their attributes, transform files under their own path, map sourcemaps to the `.svelte` file and normalize filepaths for HMR
  - Forward refs in generated React styled components, and merge string style props in Solid styled components
  - Atomize declarations using `var()`, start atomic class hashes with an uppercase letter, and fix atomic parsing of parentheses and string escapes
  - Handle circular imports, late imports, star re-exports and `?raw` imports during evaluation
  - Rewrite `css` inside exported function and class bodies, and fix declaration ordering/inclusion when moving declarations
  - Evaluate CSS of files that gain styles during dev, drop outdated HMR updates, and fix value caching of dependencies that skip evaluation or fail
  - Preserve CSS escapes in re-emitted templates, replace `$` in generated class names, and map CSS sourcemap offsets from UTF-8 bytes
  - Report unknown dependency extensions instead of panicking, and escape file paths in evaluated programs

## 0.5.0

### Minor Changes

- Lockstep release of all packages.
  - Wrap atomic CSS in `@layer utilities` after a default `@layer theme, base, components, utilities;` order, so dev and build share the same cascade. Override the order by declaring your own `@layer` statement before `@style-this/core/atomic` is imported. Unlayered CSS (including non-atomic component CSS) now takes precedence over atomic CSS

## 0.4.0

### Minor Changes

- Lockstep release of all packages.
  - Append the atomic CSS to the stylesheet of the chunk importing `@style-this/core/atomic` in builds, instead of the first stylesheet in the bundle
  - Invalidate query variants of the atomic entrypoint (e.g. `?inline`) on atomic CSS changes during HMR

## 0.3.0

### Minor Changes

- Lockstep release of all packages.
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

## 0.2.0

### Minor Changes

- Lockstep release of all packages.
  - Add atomic CSS mode, including `mergeStyles` support, non-atomic styles in atomic mode and atomic sourcemap markers
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
  - Make styled component CSS variable names and atomic-mode chunk hashes independent of the absolute project path

## 0.1.2

### Patch Changes

- 48664f7: Publish

## 0.1.1

### Patch Changes

- 01e187b: Compiler improvements

Documents changes in this package.

## 0.1.0 (2025-12-03)

### Breaking Changes

#### Initial release

The initial beta release of basic packages.
