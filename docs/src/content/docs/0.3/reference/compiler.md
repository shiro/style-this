---
title: Compiler API
description: Low-level API for building bundler integrations.
sidebar:
  order: 5
  badge:
    text: Advanced
    variant: note
slug: 0.3/reference/compiler
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
| `ignoredImports` | `Record<string, string[]>` | Imports skipped during evaluation, an empty array ignores the module. |
| `loadFile` | `(id, importer) => Promise<[filepath, code]>` | Resolves and loads an imported module. Return empty code to have it loaded natively. |
| `cssExtension` | `string` | Extension of generated stylesheets. |
| `cacheRegistry` | `JsCacheRegistry` | Where evaluated CSS is stored. |
| `atomic` | `boolean` | Atomic output. |
| `useRequire` | `boolean` | Use `require` in evaluation programs. |
| `createRequire` | `(filename) => NodeRequire` | Custom `require` factory. |
| `wrapSelectorsWithGlobal` | `boolean` | Wrap generated selectors in `:global(...)`, for CSS modules pipelines. |
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
overrides the constructor's for this call, e.g. to bind it to a plugin context.

## Cache registry

```ts
interface JsCacheRegistry {
  initializeRefs(cssRef: string, atomicRef: string): void;
}
```

`initializeRefs` must store two `Map<string, CssCachEntry>` instances on `globalThis` under the
given names. Before transforming a file, register a `CssCachEntry` (a promise with a `resolve`
method and the source `code`) under `<filepath>.<cssExtension>`. The evaluation program resolves it
with the final CSS and source map data:

```ts
type CssCachEntry = Promise<string | Error> & {
  resolve: (value: string | Error, sourcemapData?: CssSourceMapData, filepath?: string) => void;
  code: string;
};

type CssSourceMapData = Array<{ className: string; start: number; end: number }>;
```

`generateCssSourceMap` from `@style-this/core/cssSourceMap` turns `CssSourceMapData` into a
standard source map.

The Vite plugin's source is the reference implementation:
[`packages/vite/src/index.ts`](https://github.com/shiro/style-this/blob/master/packages/vite/src/index.ts).
