# @style-this/next

## 0.2.1

### Patch Changes

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

## 0.0.3

### Patch Changes

- Updated dependencies [22e88ff]
  - @style-this/core@0.1.4

## 0.0.2

### Patch Changes

- Updated dependencies [01e187b]
  - @style-this/core@0.1.3

## 0.0.1

### Patch Changes

- Updated dependencies [0c9248e]
  - @style-this/core@0.1.2
