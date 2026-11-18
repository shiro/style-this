---
title: Imports & evaluation
description: What can be interpolated into styles and how imports are evaluated at build time.
sidebar:
  order: 2
---

Styles are evaluated at **build time** in Node. The compiler extracts only the statements your
templates depend on and runs them.

## What works

```ts
import { css } from "@style-this/core";
import { colors, px } from "./theme"; // local modules, followed transitively
import { darken } from "polished";    // packages from node_modules

const gap = 4 * 2;                    // local constants and expressions

const box = css`
  gap: ${px(gap)};
  color: ${darken(0.1, colors.primary)};
`;
```

- **Local modules** are transformed and evaluated recursively. Only the exports that are actually
  used are evaluated, unrelated code in the same file doesn't run.
- **`node_modules` packages** are loaded as-is with Node's resolution.
- **Other styles and styled components** resolve to their class name.

## What doesn't

Anything that isn't known at build time:

- component props, state or signals: use [styled components](/guides/styled-components/)
- browser globals such as `window` or `document`
- code with side effects you don't want to run during the build

For runtime values in plain `css`, use a CSS custom property:

```tsx
const bar = css`
  width: var(--progress);
`;

<div className={bar} style={{ "--progress": `${value}%` }} />;
```

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

Keys match the import specifier exactly as written in the source (`import x from "./store"` →
`"./store"`). Ignored imports aren't available during evaluation, don't use them in a style.

## Errors

Errors thrown while evaluating a style, including errors in imported modules, are reported at the
original source location.

Enable [`debug`](/reference/vite/#debug) to log every transform and inspect the generated evaluation
programs.
