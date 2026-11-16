---
title: Atomic CSS
description: Emit one deduplicated class per declaration.
sidebar:
  order: 3
---

In atomic mode every top-level declaration becomes its own class, shared by every style using the
same declaration. CSS size then grows with the number of *unique declarations* instead of the
number of components.

## Enabling

```ts title="vite.config.ts"
styleThis({ atomic: true });
```

Then import the atomic entrypoint **once**, in your app's root module:

```tsx title="src/App.tsx"
import "@style-this/core/atomic";
```

This import marks where the atomic stylesheet is loaded. In builds, the atomic CSS is appended to
the stylesheet of the chunk containing this import. In non-atomic mode the import is a no-op, so
it's safe to keep it and toggle the mode from config.

:::note[Next.js]
With `@style-this/next`, atomic mode is toggled with the `ATOMIC=1` environment variable.
:::

## Output

```ts
const inner = css`
  background: red;
  padding: 10px;
`;

const outer = css`
  width: 100%;

  .${inner} {
    background: coral;
  }

  @media (max-width: 500px) {
    .${inner} {
      background: blue;
    }
  }
`;
```

```ts title="class names"
inner === "inner-oty7sd bg-gKimM p-vrRc6";
outer === "outer-mvwhqz w-YB1lg";
```

```css title="atomic stylesheet"
.bg-gKimM { background: red }
.p-vrRc6 { padding: 10px }
.w-YB1lg { width: 100% }
```

```css title="per-file stylesheet"
.outer-mvwhqz {
  .inner-oty7sd {
    background: coral;
  }
  @media (max-width: 500px) {
    .inner-oty7sd {
      background: blue;
    }
  }
}
```

- Atomic classes are named `<property prefix>-<hash>`, e.g. `bg-…` for `background`.
- Every style keeps its unique class (`inner-oty7sd`), so it can still be referenced in selectors.
- **Nested rules and at-rules are not atomized**, they stay in the per-file stylesheet scoped to
  the unique class. Same for [global styles](/guides/css/#global-styles).

## Overriding styles

Since two styles can now set the same property through different classes, plain string
concatenation gives order-dependent results. Use
[`mergeStyles`](/guides/merging-styles/), which keeps only the last atomic class per property:

```tsx
import { mergeStyles } from "@style-this/core";

<span className={mergeStyles(colorStyle, highlightStyle)} />;
```

Styled components do this automatically for `className` / `class` and for
[extended components](/guides/styled-components/#extending-components).

## Source maps and HMR

Atomic rules carry source map markers back to the template they came from. During development the
atomic stylesheet is hot-updated whenever any module contributes new declarations.
