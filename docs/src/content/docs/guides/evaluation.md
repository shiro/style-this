---
title: Build-time evaluation
description: What can be interpolated into styles and how imports are evaluated at build time.
sidebar:
  order: 2
---

Styles are evaluated at **build time** in Node. The compiler extracts only the code your templates
depend on and runs it, unrelated code in the same file or in imported modules doesn't run.

## What works

```ts
import { css } from "@style-this/core";
import { colors, px } from "./theme";      // local modules, followed transitively
import { darken } from "polished";         // packages from node_modules
import tokens from "./tokens.json";         // JSON files
import icon from "./icon.svg?raw";          // file contents as a string

const gap = 4 * 2;                         // constants and expressions

const box = css`
  gap: ${px(gap)};
  color: ${darken(0.1, colors.primary)};
  border-color: ${tokens.border};
  background-image: url("data:image/svg+xml,${encodeURIComponent(icon)}");
`;
```

- **Local modules** are transformed and evaluated recursively. Only the exports that are actually
  used are evaluated. Re-exports and barrel files (`export { x } from`, `export * from`,
  `export * as ns from`) are followed.
- **Packages in `node_modules`** are loaded as-is with Node's resolution.
- **JSON files** are parsed like in Vite: the default export is the whole value, top-level keys are
  also available as named exports.
- **`?raw` imports** evaluate to the file's contents. Other queries (e.g. `?url`) aren't supported.
- **Other styles and styled components** resolve to their class name.
- **Functions and classes** can be called, wherever they're declared in the module. Like in plain
  JS, a value only has to be initialized by the time it's used.

Side-effect imports such as `import "./global.css"` are skipped during evaluation.

## What doesn't

Anything that isn't known at build time:

- **Function parameters, props, state or signals.** Use
  [styled components](/guides/styled-components/) for per-instance values. Interpolating a parameter
  fails with `tried to access dynamic variable '<name>'`.
- **Browser globals** such as `window` or `document`.
- **Asynchronous values.** Interpolations aren't awaited, a promise ends up as `[object Promise]`.
- **Imports of other file types** (e.g. `import logo from "./logo.svg"`) can't be evaluated. Use
  `?raw` or keep them out of styles.
- **Code with side effects** you don't want to run during the build.

For runtime values in plain `css`, use a CSS custom property:

```tsx
const bar = css`
  width: var(--progress);
`;

<div className={bar} style={{ "--progress": `${value}%` }} />;
```

## Circular imports

Modules may import each other. Like in JS, a value from a module that's still being evaluated can't
be used yet:

```ts title="a.tsx"
import { linkColor } from "./b";

export const accent = "coral";
export const card = css`
  color: ${linkColor};
`;
```

```ts title="b.ts"
import { accent } from "./a";

export const linkColor = accent; // a.tsx isn't evaluated yet
```

This fails with `circular import of '…/a.tsx' from '…/b.ts', its values can't be used before it's
evaluated`. The same applies to two files whose styles reference each other's classes. Move the
shared values into a third module both import.

## Ignoring imports

Some imports can't or shouldn't be evaluated: they touch the DOM, are slow, or are only used at
runtime. `ignoredImports` skips them.

```ts title="vite.config.ts"
import styleThis, { DefaultImport } from "@style-this/vite";

styleThis({
  ignoredImports: {
    // the whole module
    "some-browser-only-lib": true,
    // specific named imports
    "./analytics": ["track"],
    // the default import
    "./store": [DefaultImport],
  },
});
```

- Keys match the import specifier exactly as written in the source (`import x from "./store"` →
  `"./store"`).
- Names match the **imported** name, `import { track as log } from "./analytics"` is ignored by
  `["track"]`.
- Ignored imports aren't available during evaluation. Code referencing them may exist in the
  evaluated program, but must not call them while computing a style.

`ignoredImports` is an option of the [Vite plugin](/reference/vite/#ignoredimports).

## Errors and debugging

Errors thrown while evaluating a style, including errors in imported modules, are reported by the
bundler as errors of the file's stylesheet, pointing at the original source location. A broken file
doesn't block the others, and in dev it recovers once the error is fixed.

With the Vite plugin, enable [`debug`](/reference/vite/#debug) to log every transform and inspect
the generated evaluation programs.
