---
title: Merging styles
description: Combine class lists with mergeStyles and joinStyles.
sidebar:
  order: 4
slug: 0.5/guides/merging-styles
---

Styles are class names, so applying several of them means joining strings. `mergeStyles` does that
and is the one helper to reach for.

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

* Falsy values (`false`, `null`, `undefined`, `""`) are ignored, so conditions can be inlined.
* Identical classes are de-duplicated.
* In [atomic mode](/0.5/guides/atomic-css/), atomic classes setting the same property are de-duplicated
  and the last one wins. Above, `color: coral` is dropped when `highlight` is applied.

### Who wins in default mode

In default mode both classes stay on the element and the regular CSS cascade decides: same
specificity, so the rule that comes **later in the stylesheet** wins. That depends on where the
styles are defined and the order modules are imported, not on the order passed to `mergeStyles`. If
an override must always apply, either:

* use [atomic mode](/0.5/guides/atomic-css/), where `mergeStyles` order is authoritative, or
* raise its specificity with a nested selector (`&& { ... }`) or a
  [contextual override](/0.5/examples/variants/#contextual-overrides).

There's nothing to de-duplicate in default mode, so the transform replaces `mergeStyles` with the
cheaper `joinStyles`. Write `mergeStyles` everywhere and switch modes freely.

## `joinStyles`

Joins class lists and ignores falsy values, without any de-duplication.

```ts
import { joinStyles } from "@style-this/core";

joinStyles("a", false, "b"); // "a b"
```

## With styled components

Styled components merge an incoming `className` / `class` with `mergeStyles` automatically:

```tsx
<Button className={override} />
```
