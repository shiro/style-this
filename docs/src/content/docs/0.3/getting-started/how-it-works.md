---
title: How it works
description: What the style-this transform does to your code.
sidebar:
  order: 2
slug: 0.3/getting-started/how-it-works
---

style-this runs as a bundler plugin. For each matching file it:

1. Finds `css` and `styled` tagged templates.
2. Builds a small program containing only the code those templates depend on (local constants,
   imported values, other styles) and **evaluates it at build time**.
3. Emits the resulting CSS as a virtual CSS module and imports it from the file.
4. Replaces each template with its class name.

## Example

```tsx title="Button.tsx"
import { css } from "@style-this/core";

const spacing = 16;

const button = css`
  padding: ${spacing / 2}px;
  background: red;
`;
```

becomes

```tsx title="Button.tsx (transformed)"
import "virtual:style-this:/Button.tsx.css";

const button = "button-4tu7c1";
```

```css title="Button.tsx.css"
.button-4tu7c1 {
  padding: 8px;
  background: red;
}
```

The class name is the variable name plus a stable hash, so it stays readable in devtools. The hash
doesn't depend on the absolute project path, output is reproducible across machines.

## Build-time evaluation

Because expressions are evaluated at build time, anything interpolated into a `css` template must be
computable without a browser, see [Imports & evaluation](/0.3/guides/evaluation/).

Dynamic, per-instance values are supported through
[styled components](/0.3/guides/styled-components/), which compile function expressions to CSS custom
properties set through the `style` attribute.

## Output modes

* **Default**: one rule per `css` template, emitted into a per-file stylesheet.
* **[Atomic](/0.3/guides/atomic-css/)**: every top-level declaration becomes its own deduplicated class.

## Runtime footprint

`css`, `styled` and `extraClass` are removed entirely by the transform (calling them at runtime
throws). The only code that may remain in your bundle is the tiny `mergeStyles` / `joinStyles`
helper used to combine class lists.
