# Changelog

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
  - Make styled component CSS variable names independent of the absolute project path

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
