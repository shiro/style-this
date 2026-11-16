---
title: Writing styles with css
description: The css tagged template, expressions, nesting, selectors and global styles.
sidebar:
  order: 1
slug: 0.3/guides/css
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
`css` must be assigned to a variable at the top level of a module, the variable name is used to
build the class name.
:::

## Expressions

Any expression that can be evaluated at build time can be interpolated.

```ts
import { colors } from "./theme";

const spacing = 16;

const box = css`
  padding: ${spacing}px;
  border-radius: ${spacing / 2}px;
  color: ${colors.primary};
`;
```

Values can come from other modules, including transitive imports. Changing them triggers HMR for
every style that depends on them. See [Imports & evaluation](/0.3/guides/evaluation/) for the rules.

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

A style interpolates to its class name, use it in selectors to style descendants contextually.

```ts
const inner = css`
  background: red;
`;

const outer = css`
  width: 100%;

  .${inner} {
    background: coral;
  }
`;
```

This also works across files, and with [styled components](/0.3/guides/styled-components/):

```ts
import { Button } from "./Button";

const toolbar = css`
  .${Button} {
    margin: 0;
  }
`;
```

## Composing styles

Every style exposes its raw CSS body as `.css`, interpolate it to inline one style into another.

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

To combine classes at the usage site instead, use [`mergeStyles`](/0.3/guides/merging-styles/).

## Reusable fragments

`style` is a plain string-concatenating tag. Use it for fragments and mixins, it gives you the same
editor highlighting as `css` without creating a class.

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

## Adding extra classes

`extraClass` appends additional class names to the generated one, handy for hooks used by tests,
third party CSS or global selectors.

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

  .Global__Main {
    background: coral;
  }
`;
```

Global styles are never atomized in [atomic mode](/0.3/guides/atomic-css/).
