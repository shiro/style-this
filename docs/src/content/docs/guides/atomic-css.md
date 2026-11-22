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

1. Turn it on in your bundler integration:

   ```ts title="vite.config.ts"
   styleThis({ atomic: true });
   ```

   ```js title="webpack.config.js"
   new StyleThisPlugin({ atomic: true });
   ```

   ```bash title="Next.js"
   ATOMIC=1 next build
   ```

2. Import the atomic entrypoint **once**, in your app's root module (root layout, `_app`, `App.tsx`,
   ...):

   ```tsx title="src/App.tsx"
   import "@style-this/core/atomic";
   ```

   It marks where the atomic CSS and its [cascade layers](#cascade-layers) are loaded. In default
   mode the import is a no-op, so keep it and toggle the mode from config.

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
inner === "inner-oty7sd bg-GsBIw p-VSGpc";
outer === "outer-mvwhqz w-Yb3Gw";
```

```css title="atomic CSS"
@layer theme, base, components, utilities;
@layer utilities {
  .bg-GsBIw { background: red }
  .p-VSGpc { padding: 10px }
  .w-Yb3Gw { width: 100% }
}
```

```css title="per-file CSS"
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

- Atomic classes are named `<property prefix>-<hash>`, e.g. `bg-…` for `background`. The hash
  always starts with an uppercase letter, so they can't be confused with hand-written classes like
  `bg-light`.
- Every style keeps its unique class (`inner-oty7sd`), so it can still be
  [referenced in selectors](/guides/css/#referencing-other-styles).
- **Nested rules and at-rules aren't atomized.** They stay in the per-file CSS, scoped to the unique
  class. Same for [global styles](/guides/css/#global-styles).
- Dynamic declarations of [styled components](/guides/styled-components/#dynamic-styles-with-styleprops)
  are atomized too, e.g. `.p-NM_En { padding: var(--var1-4lyfgx) }`.

### Where the atomic CSS is loaded

- **Vite**: all atomic rules are collected into one stylesheet, served by the
  `@style-this/core/atomic` import. In builds it's appended to the stylesheet of the chunk containing
  that import.
- **webpack and Next.js**: there's no step that collects the CSS of all files, so every file's
  stylesheet includes the atomic rules it uses. The `@style-this/core/atomic` import only declares
  the layer order.

The cascade works the same either way.

## Overriding styles

Two styles can set the same property through different classes, so plain string concatenation
gives order-dependent results. Use [`mergeStyles`](/guides/merging-styles/), which keeps only the
last atomic class per property:

```tsx
import { mergeStyles } from "@style-this/core";

<span className={mergeStyles(colorStyle, highlightStyle)} />;
```

Styled components do this automatically for `className` / `class` and for
[extended components](/guides/styled-components/#extending-components).

Shorthands and longhands are emitted so that longhands win, which matches regular CSS when the
longhand comes later. When the shorthand comes later, both `mergeStyles` and the compiler (within a
style) drop the earlier longhands it overrides: `padding-top: 8px` followed by `padding: 0` gives
`padding: 0`, like in default mode.

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

- **Dev and build behave the same.** The cascade doesn't depend on where the atomic CSS ends up in
  the bundle.

The layer names match Tailwind CSS v4, so both can be used side by side.

### Custom layer order

Declare your own order before the atomic entrypoint is imported. The first declaration of a layer
fixes its position, so the default statement then has no effect.

```css title="src/app.css"
@layer reset, base, components, utilities, overrides;
```

```tsx title="src/App.tsx"
import "./app.css";
import "@style-this/core/atomic";
```

Default layers missing from your order (`theme` above) are appended after yours.

## Source maps and HMR

With the Vite plugin, atomic rules carry source map markers back to the template they came from,
and the atomic stylesheet is hot-updated whenever a module contributes new declarations, see
[HMR & source maps](/guides/hmr-and-sourcemaps/).
