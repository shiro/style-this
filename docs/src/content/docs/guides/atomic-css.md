---
title: Atomic CSS
description: Emit one deduplicated class per declaration, in a utilities cascade layer.
sidebar:
  order: 5
---

In atomic mode every top-level declaration becomes its own class, shared by every style using the
same declaration. CSS size then grows with the number of *unique declarations* instead of the number
of components. Your code stays the same, only the output changes.

## Enabling

```ts title="vite.config.ts"
styleThis({ atomic: true });
```

Then import the atomic stylesheet **once**, in your app's root module:

```tsx title="src/App.tsx"
import "@style-this/core/atomic";
```

The import marks where the atomic stylesheet is loaded. In builds, the atomic CSS is appended to the
stylesheet of the chunk containing this import. In default mode the import is a no-op, so keep it
and toggle the mode from config.

:::note[Next.js]
With `@style-this/next`, atomic mode is toggled with the `ATOMIC=1` environment variable instead.
There's no single atomic stylesheet, every file's stylesheet includes the atomic CSS it uses (in the
same cascade layer). The entrypoint import only fixes the layer order.
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
@layer theme, base, components, utilities;
@layer utilities {
  .bg-gKimM { background: red }
  .p-vrRc6 { padding: 10px }
  .w-YB1lg { width: 100% }
}
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
- Every style keeps its unique class (`inner-oty7sd`), so it can still be
  [referenced in selectors](/guides/css/#referencing-other-styles).
- **Nested rules and at-rules aren't atomized.** They stay in the per-file stylesheet, scoped to the
  unique class. Same for [global styles](/guides/css/#global-styles).

## Overriding styles

Two styles can now set the same property through different classes, so plain string concatenation
gives order-dependent results. Use [`mergeStyles`](/guides/merging-styles/), which keeps only the
last atomic class per property:

```tsx
import { mergeStyles } from "@style-this/core";

<span className={mergeStyles(colorStyle, highlightStyle)} />;
```

Styled components do this automatically for `className` / `class` and for
[extended components](/guides/styled-components/#extending-components).

## Cascade layers

Atomic classes live in the `utilities` [cascade layer](https://developer.mozilla.org/docs/Web/CSS/@layer),
declared after a default order of `theme, base, components, utilities`. Layered rules always lose
against unlayered ones, regardless of specificity or position, so:

- **Per-file CSS beats atomic CSS.** Nested rules, at-rules and global styles (unlayered) override
  atomic declarations, which makes [contextual overrides](/examples/variants/#contextual-overrides)
  reliable.
- **Your own unlayered CSS beats atomic CSS too.** Put resets and base styles into a lower layer so
  atomic classes can override them:

  ```css title="src/app.css"
  @layer base {
    h1 {
      font-size: 4rem;
    }
  }
  ```

- **Dev and build behave the same.** The cascade doesn't depend on where the atomic stylesheet ends
  up in the bundle.

The layer names match Tailwind CSS v4, so both can be used side by side.

### Custom layer order

Declare your own order before the atomic stylesheet is loaded. The first declaration of a layer
fixes its position, so the default statement then has no effect.

```css title="src/layers.css"
@layer reset, base, components, utilities, overrides;
```

```tsx title="src/App.tsx"
import "./layers.css";
import "@style-this/core/atomic";
```

Default layers missing from your order (`theme` above) are appended after yours.

## Source maps and HMR

Atomic rules carry source map markers back to the template they came from. During development the
atomic stylesheet is hot-updated whenever a module contributes new declarations.
