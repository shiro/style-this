---
title: Merging styles
description: Combine class lists with mergeStyles and joinStyles.
sidebar:
  order: 4
slug: 0.3/guides/merging-styles
---

## `mergeStyles`

Joins class lists so that **later styles override earlier ones**.

```tsx
import { css, mergeStyles } from "@style-this/core";

const color = css`
  color: coral;
  background: white;
`;

const highlight = css`
  color: crimson;
`;

<span className={mergeStyles(color, isActive && highlight)} />;
```

* Falsy values (`false`, `null`, `undefined`, `""`) are ignored, so conditionals can be inlined.
* In [atomic mode](/0.3/guides/atomic-css/), atomic classes of the same property are de-duplicated and
  the last one wins. Above, `color: coral` is dropped when `highlight` is applied.
* Other classes are only de-duplicated when identical.

In non-atomic mode there's nothing to de-duplicate, so the transform replaces `mergeStyles` with the
cheaper `joinStyles`. You can write `mergeStyles` everywhere and switch modes freely.

:::caution
In non-atomic mode overriding relies on regular CSS rules: both classes are applied and the cascade
(specificity, then source order) decides. Prefer atomic mode if you rely heavily on overrides.
:::

## `joinStyles`

Joins class lists and ignores falsy values, without any de-duplication.

```ts
import { joinStyles } from "@style-this/core";

joinStyles("a", false, "b"); // "a b"
```

## With styled components

Styled components merge the incoming `className` / `class` with `mergeStyles` semantics, no manual
work needed:

```tsx
<Button className={override} />
```
