# @style-this/webpack

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

### Patch Changes

- Updated dependencies
  - @style-this/core@0.3.0

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
