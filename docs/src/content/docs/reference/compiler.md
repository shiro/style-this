---
title: Compiler API
description: Low-level API for building bundler integrations.
sidebar:
  order: 5
  badge:
    text: Advanced
    variant: note
---

`@style-this/core/compiler` exposes the Rust/WebAssembly transformer the bundler plugins are built
on. You only need it to integrate a new bundler.

:::caution
This API is internal and may change between minor releases.
:::

```ts
import { initializeStyleThis, Transformer } from "@style-this/core/compiler";

await initializeStyleThis(); // loads the wasm module, call once

const transformer = new Transformer({
  cwd: process.cwd(),
  ignoredImports: {},
  cssExtension: "css",
  loadFile: async (id, importer) => [resolvedPath, sourceCode],
  cacheRegistry,
});

const result = await transformer.transform(code, filepath, false);
// undefined when the file contains no styles
// otherwise { code, sourcemap }
```

## `Transformer` options

| Option | Type | Description |
| --- | --- | --- |
| `cwd` | `string` | Project root, generated ids and hashes are relative to it. |
| `ignoredImports` | `Record<string, string[]>` | Imported names skipped during evaluation per specifier, an empty array ignores the module. |
| `loadFile` | `(id, importer) => Promise<[filepath, code]>` | Resolves and loads an imported module, see [below](#loading-files). |
| `cssExtension` | `string` | Extension of generated stylesheets. |
| `cacheRegistry` | `JsCacheRegistry` | Where evaluated CSS is stored. |
| `atomic` | `boolean` | Atomic output. |
| `useRequire` | `boolean` | Use `require` in evaluation programs. |
| `createRequire` | `(filename) => NodeRequire` | Custom `require` factory. |
| `resolveVirtualImport` | `(kind, filepath) => string` | Import specifier of the virtual modules inserted into `filepath`, see [below](#virtual-imports). |
| `debug` | `boolean` | Verbose logging. |
| `onDebugVirtualModule` | `(name, code) => void` | Receives every generated evaluation program. |

## `transform`

```ts
transform(
  code: string,
  filepath: string,
  skipCssEval: boolean,
  loadFile?: (id: string, importer: string) => Promise<[string, string]>,
): Promise<{ code: string; sourcemap: string } | undefined>
```

`skipCssEval` skips evaluation when the CSS for this file is already cached. The optional `loadFile`
overrides the constructor's for this transform and its dependency evaluations, e.g. to bind it to a
plugin context.

The CSS is evaluated in the background and delivered through the [cache registry](#cache-registry).
Errors that stop the transform itself (syntax errors, unsupported extensions, ...) reject the
promise and resolve the file's pending cache entries with the same error, so nothing waits on them.

## Loading files

`loadFile` resolves `id` relative to `importer` and returns the resolved path and its code:

- return empty code to have the module loaded natively (e.g. packages in `node_modules`)
- for ids with a query (`?raw`), return the path **with** the query and the source file's contents

## Virtual imports

Transformed files import their stylesheet (`kind: "css"`) and, in atomic mode, their class module
(`kind: "atomicProgram"`). By default these are `virtual:style-this:<filepath>.<cssExtension>` and
`virtual:style-this:<filepath>.style-this.js`. `resolveVirtualImport` replaces the specifier for
bundlers without virtual modules, e.g. a file on disk with a query that a loader serves. Throwing,
or returning a non-string, fails the transform.

## Cache registry

```ts
interface JsCacheRegistry {
  initializeRefs(cssRef: string, atomicRef: string): void;
}
```

`initializeRefs` must store two `Map<string, CssCachEntry>` instances on `globalThis` under the
given names. Before transforming a file, register a `CssCachEntry` (a promise with a `resolve`
method and the source `code`) under `<filepath>.<cssExtension>`, and in atomic mode under
`<filepath>.style-this.js`. The evaluation resolves the entries it started with, with the final
CSS and source map data, or with an `Error`:

```ts
type CssCachEntry = Promise<string | Error> & {
  resolve: (value: string | Error, sourcemapData?: CssSourceMapData, filepath?: string) => void;
  code: string;
};

type CssSourceMapData = Array<{ className: string; start: number; end: number }>;
```

`start` and `end` are UTF-8 byte offsets into the transformed code. `generateCssSourceMap` from
`@style-this/core/cssSourceMap` turns `CssSourceMapData` into a standard source map.

## Invalidation and atomic CSS

| Method | Description |
| --- | --- |
| `invalidate_file(filepath, code?)` | Updates cached values after a change (`code` omitted when deleted), returns the files whose CSS is affected. |
| `get_evaluated_dependencies(filepath)` | Files the CSS of `filepath` was evaluated from, for bundlers that don't report changed files. |
| `get_atomic_css()` | All collected atomic CSS. |
| `get_file_atomic_css(filepath)` | Atomic CSS used by one file, with every property rank in its own nested layer, for bundlers that can't collect one atomic stylesheet. |

Reference implementations:
[`packages/vite/src/index.ts`](https://github.com/shiro/style-this/blob/master/packages/vite/src/index.ts)
(virtual modules, precise HMR) and
[`packages/webpack/src/loaders/transform.ts`](https://github.com/shiro/style-this/blob/master/packages/webpack/src/loaders/transform.ts)
(loaders, `resolveVirtualImport`, per-file atomic CSS).
