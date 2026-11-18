---
title: "@style-this/react & @style-this/solid"
description: API reference for styled components.
sidebar:
  order: 2
  label: "@style-this/react · solid"
slug: 0.4/reference/styled
---

```ts
import { styled } from "@style-this/react"; // peer: react ^18 || ^19
import { styled } from "@style-this/solid"; // peer: solid-js
```

Both packages export a single `styled` with the same shape.

## `styled.<element>`

```ts
styled.button<StyleProps>`...`
```

Creates a component rendering the intrinsic element. All of the element's props are accepted.

## `styled(component)`

```ts
styled(Base)<StyleProps>`...`
styled("button")<StyleProps>`...`
```

Extends a component or intrinsic element. The component must accept `className` and `style`
(React) or `class` (Solid).

## `StyleProps`

Optional type argument describing the dynamic inputs. Must be an object type and can't contain a
`props` key.

| `StyleProps` | Resulting component |
| --- | --- |
| omitted | base props, plus a static `.css` property |
| given | base props & `{ styleProps: StyleProps }` |

When extending, the base component's `styleProps` are part of the resulting `styleProps`.

## Template expressions

```ts
type TemplateExpression<StyleProps> =
  | string
  | number
  | ((arg: StyleProps & { props: ComponentProps }) => string | number);
```

* `string` / `number`: evaluated at build time, like in `css`.
* function: evaluated at render time, compiled to a CSS custom property.
  * receives every `styleProps` field
  * `props` holds the component's props (without `styleProps`)
  * in Solid the function is tracked and re-runs when its dependencies change

## Generated component

* applies its class, then the incoming `className` / `class`, merged with
  [`mergeStyles`](/0.4/reference/core/#mergestyles) semantics
* sets custom properties through `style`, the incoming `style` is spread last
* strips `styleProps` before forwarding props
* `String(Component)` returns the class name, for use in
  [selectors](/0.4/guides/styled-components/#using-components-in-selectors)
