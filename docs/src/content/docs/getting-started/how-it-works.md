---
title: How it works
description: What the style-this transform does to your code.
sidebar:
  order: 2
---

style-this runs as a bundler plugin. For each matching file it:

1. Finds the `css` and `styled` tagged templates.
2. Builds a small program containing only the code those templates depend on (constants, imported
   values, other styles) and **evaluates it at build time** in Node.
3. Emits the resulting CSS as a stylesheet belonging to the file and imports it from the file.
4. Replaces each template with its class name, or with a thin component for `styled`.

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

The stylesheet import differs per bundler (the Vite plugin uses virtual modules, webpack and Next.js
use a file with a query), the result is the same.

## Class names

A class name is the name of the variable the style is assigned to, plus a hash: readable in
devtools and unique per style. The hash doesn't depend on the absolute project path, so output is
reproducible across machines.

- Styles nested in an object or a function take the name of the nearest variable they're declared
  in. Styles without any (e.g. `` return css`...` ``) get a generated name.
- `$` isn't valid in CSS class names and is replaced with `__` (`$btn` → `__btn-…`).
- Variables starting with `_Global` produce [global styles](/guides/css/#global-styles) without a
  class.

## Consequences

- **Values are computed at build time.** Anything interpolated into `css` must be computable
  without a browser and without runtime data, see [Build-time evaluation](/guides/evaluation/).
  Per-instance values go through [styled components](/guides/styled-components/), which compile them
  to CSS custom properties.
- **There's (almost) no runtime.** `css`, `styled` and `extraClass` are removed by the transform,
  calling them at runtime throws. What may remain in your bundle are tiny helpers:
  `mergeStyles` / `joinStyles` to combine class lists and the generated styled components.

## Output modes

- **Default**: one rule per style, in a stylesheet per file. This is what the example above shows.
- **[Atomic](/guides/atomic-css/)**: every top-level declaration of a common property becomes its
  own class, shared by all styles using the same declaration.

Both modes use the same source code, you switch between them in the plugin config.
