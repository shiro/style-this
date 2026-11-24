---
title: Writing styles
description: The css tagged template, expressions, nesting, selectors, fragments and global styles.
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

## Where styles can be written

Styles are usually top-level variables, but they can be defined anywhere: inside functions, class
bodies or object literals, exported or not.

```tsx
const styles = {
  title: css`
    font-weight: bold;
  `,
};

export function Badge() {
  const badge = css`
    border-radius: 999px;
  `;
  return <span className={badge} />;
}
```

Wherever it's written, a style is still computed once at build time. Its interpolations can't use
function parameters, props or state, see [Build-time evaluation](/guides/evaluation/#what-doesnt).
The variable a style is assigned to names its class, see
[Class names](/getting-started/how-it-works/#class-names).

## Expressions

Anything that can be computed at build time can be interpolated.

```ts
import { colors } from "./theme";

const spacing = 16;

const box = css`
  padding: ${spacing}px;
  border-radius: ${spacing / 2}px;
  color: ${colors.primary};
`;
```

Values can come from the same file or from other modules, including packages and JSON files. The
next guide, [Build-time evaluation](/guides/evaluation/), covers what's allowed.

The template is CSS, so CSS escapes are written as in a stylesheet:

```ts
const quote = css`
  &::before {
    content: "\201C";
  }
`;
```

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

Every style exposes its CSS body as `.css`. Interpolate it to inline one style into another. It only
exists during build-time evaluation, at runtime a style is just its class name and `.css` is
`undefined`.

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

To combine class names where they're used instead, use [`mergeStyles`](/guides/merging-styles/).

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

export const hover = (body: string) => style`
  @media (hover: hover) {
    &:hover { ${body} }
  }
`;

const title = css`
  ${truncate}
  ${hover("color: crimson;")}
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

Extra classes are only part of the class name string. When the style is
[referenced in a selector](#referencing-other-styles), only its generated class is used.

## Global styles

A style whose variable name starts with `_Global` is emitted as-is, without a wrapping class.

```ts
const _GlobalReset = css`
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;
```

Its CSS is loaded with the module that defines it, so make sure that module is imported somewhere
in your app.
