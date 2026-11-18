---
title: "@style-this/core"
description: API reference for the core package.
sidebar:
  order: 1
---

```ts
import { css, style, extraClass, mergeStyles, joinStyles } from "@style-this/core";
```

## `css`

```ts
const css: (strings: TemplateStringsArray, ...expr: any[]) => string & { css: string };
```

Tagged template defining a style. Compiles to its class name.

- `.css` holds the evaluated CSS body, only available while evaluating other styles
  ([composition](/guides/css/#composing-styles)).
- Variables prefixed with `_Global` produce [global styles](/guides/css/#global-styles).
- Throws when called at runtime, which means the file wasn't transformed, see
  [Troubleshooting](/troubleshooting/).

## `style`

```ts
const style: (
  strings: TemplateStringsArray,
  ...expr: Array<string | number | CSSProperties>
) => string;
```

Concatenates the template into a string. Doesn't create a class, used for
[fragments](/guides/css/#reusable-fragments).

## `extraClass`

```ts
const extraClass: (...classes: string[]) => string;
```

Only valid inside a `css` or `styled` template. Appends the given class names (space separated
strings are allowed) to the generated class.

## `mergeStyles`

```ts
const mergeStyles: (...classes: Array<string | false | null | undefined>) => string;
```

Joins class lists. Atomic classes of the same property are de-duplicated, the last one wins. Other
classes are de-duplicated only if identical. Replaced by `joinStyles` in default mode. See
[Merging styles](/guides/merging-styles/).

## `joinStyles`

```ts
const joinStyles: (...classes: Array<string | false | null | undefined>) => string;
```

Joins class lists, ignoring falsy values.

## `CSSProperties`

```ts
type CSSProperties = { [key: string]: string | number | CSSProperties };
```

## `@style-this/core/atomic`

```ts
import "@style-this/core/atomic";
```

Side-effect only entrypoint of the [atomic stylesheet](/guides/atomic-css/). Resolved to a virtual
CSS module by the Vite plugin, which declares the layer order
`@layer theme, base, components, utilities;` and wraps the atomic CSS in `@layer utilities`
([Cascade layers](/guides/atomic-css/#cascade-layers)). A no-op in default mode.

## Other entrypoints

| Entrypoint | Purpose |
| --- | --- |
| `@style-this/core/compiler` | The WebAssembly transformer, see [Compiler API](/reference/compiler/). |
| `@style-this/core/cssSourceMap` | `generateCssSourceMap`, used by bundler integrations. |
