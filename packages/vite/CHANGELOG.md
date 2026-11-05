# Changelog

## 0.2.1

### Patch Changes

- Fix `@style-this/core/cssSourceMap` and `@style-this/core/atomic` exporting TypeScript sources, which broke installs from npm
- Only transform JS/TS and Svelte files in the vite plugin, fixes builds with extension-less virtual modules (e.g. vinxi)
- Updated dependencies
  - @style-this/core@0.2.1

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

### Patch Changes

- Updated dependencies
  - @style-this/core@0.2.0

## 0.1.5

### Patch Changes

- 22e88ff: Add async compilation
- Updated dependencies [22e88ff]
  - @style-this/core@0.1.4

## 0.1.4

### Patch Changes

- 01e187b: Compiler improvements
- Updated dependencies [01e187b]
  - @style-this/core@0.1.3

## 0.1.3

### Patch Changes

- Updated dependencies [0c9248e]
  - @style-this/core@0.1.2

## 0.1.2

### Patch Changes

- Fix types

## 0.1.1

### Patch Changes

- Fix dependency versions

Documents changes in this package.

## 0.1.0 (2025-12-03)

### Breaking Changes

#### Initial release

The initial beta release of basic packages.

Some text
