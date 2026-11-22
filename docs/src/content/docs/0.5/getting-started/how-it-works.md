---
title: How it works
description: What the style-this transform does to your code.
sidebar:
  order: 2
slug: 0.5/getting-started/how-it-works
---

style-this runs as a bundler plugin. For each matching file it:

1. Finds `css` and `styled` tagged templates.
2. Builds a small program containing only the code those templates depend on (local constants,
   imported values, other styles) and **evaluates it at build time**.
3. Emits the resulting CSS as a virtual stylesheet and imports it from the file.
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
doesn't depend on the absolute project path, so output is reproducible across machines.

## Consequences

* **Values are computed at build time.** Anything interpolated into `css` must be computable
  without a browser, see [Imports & evaluation](/0.5/guides/evaluation/). Per-instance values go through
  [styled components](/0.5/guides/styled-components/), which compile them to CSS custom properties.
* **There's (almost) no runtime.** `css`, `styled` and `extraClass` are removed by the transform,
  calling them at runtime throws. The only helper that may remain in your bundle is the tiny
  `mergeStyles` / `joinStyles` used to combine class lists.

## Output modes

* **Default**: one rule per style, in a per-file stylesheet. This is what the example above shows.
* **[Atomic](/0.5/guides/atomic-css/)**: every top-level declaration becomes its own deduplicated
  class, collected into a single stylesheet.

You can switch between them from config without changing your code.
