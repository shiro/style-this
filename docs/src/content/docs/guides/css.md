---
title: Writing styles
description: The css tagged template, expressions, nesting, selectors and global styles.
sidebar:
  order: 1
---

`css` is a tagged template that returns a class name.

```tsx
import { css } from "@style-this/core";

const box = css`
  display: flex;
  gap: 8px;
`;

<div className={box} />;
```

:::note
Assign `css` to a variable at the top level of a module. The variable name becomes part of the class
name.
:::

## Expressions

Anything that can be evaluated at build time can be interpolated.

```ts
import { colors } from "./theme";

const spacing = 16;

const box = css`
  padding: ${spacing}px;
  border-radius: ${spacing / 2}px;
  color: ${colors.primary};
`;
```

Values can come from other modules, including transitive imports. The next guide,
[Imports & evaluation](/guides/evaluation/), covers what's allowed.

## Nesting, pseudo classes and at-rules

The template body is emitted inside the generated class, so native CSS nesting works.

```ts
const link = css`
  color: blue;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;
```

## Referencing other styles

A style interpolates to its class name. Use it in selectors to style descendants contextually.

```ts
const inner = css`
  background: red;
`;

const outer = css`
  .${inner} {
    background: coral;
  }
`;
```

This works across files and with [styled components](/guides/styled-components/#using-components-in-selectors).

## Composing styles

Every style exposes its CSS body as `.css`. Interpolate it to inline one style into another.

```ts
const base = css`
  border: 1px solid blue;
  border-radius: 2px;
`;

const primary = css`
  ${base.css}
  background: blue;
`;
```

To combine class names at the usage site instead, use [`mergeStyles`](/guides/merging-styles/).

## Reusable fragments

`style` concatenates a template into a plain string without creating a class. Use it for fragments
and mixins, it gets the same editor highlighting as `css`.

```ts
import { css, style } from "@style-this/core";

export const truncate = style`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const title = css`
  ${truncate}
  font-weight: bold;
`;
```

## Extra classes

`extraClass` adds class names next to the generated one, handy for test hooks, third party CSS or
global selectors.

```ts
import { css, extraClass } from "@style-this/core";

const counter = css`
  display: flex;
  ${extraClass("counter js-counter")}
`;
// "counter-4tu7c1 counter js-counter"
```

## Global styles

A style whose variable name starts with `_Global` is emitted as-is, without a wrapping class.

```ts
const _GlobalReset = css`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;
```

Its CSS is loaded with the module, so make sure the module is imported somewhere in your app.
