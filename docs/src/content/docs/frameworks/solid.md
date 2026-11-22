---
title: SolidJS & SolidStart
description: Use style-this with SolidJS, SolidStart 1 (vinxi) and SolidStart 2.
sidebar:
  order: 2
---

## Setup

```bash
pnpm add @style-this/core @style-this/solid
pnpm add -D @style-this/vite
```

Register the plugin for your setup:

### Vite + Solid

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [styleThis({ filter: /\.tsx$/ }), solid()],
});
```

### SolidStart 2

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [
    styleThis({ filter: /\.tsx$/ }),
    solidStart(),
    nitro(),
  ],
  css: { devSourcemap: true },
});
```

### SolidStart 1 (vinxi)

```ts title="app.config.ts"
import { defineConfig } from "@solidjs/start/config";
import styleThis from "@style-this/vite";

export default defineConfig({
  vite() {
    return {
      plugins: [
        // vinxi bundles its own vite, the plugin types may not line up
        styleThis({ filter: /\.tsx$/ }) as any,
      ],
    };
  },
});
```

The plugin keeps `@style-this/core` out of Vite's SSR externals automatically, so styles and the
atomic entrypoint resolve on the server too.

## Usage

```tsx title="src/components/Counter.tsx"
import { createSignal } from "solid-js";
import { css } from "@style-this/core";
import { styled } from "@style-this/solid";

const wrapper = css`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ pad: number }>`
  padding: ${({ pad }) => `${pad}px`};
  background: ${({ props }) => (props.disabled ? "red" : "green")};
`;

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <div class={wrapper}>
      {count()}
      <Button
        styleProps={{ pad: 8 }}
        disabled={count() >= 3}
        onClick={() => setCount(count() + 1)}
      >
        count me
      </Button>
    </div>
  );
}
```

- Dynamic expressions are reactive: they re-run whenever the signals or props they read change.
- The `style` prop of styled components accepts an object or a CSS string.

## Atomic mode

Set `atomic: true` and import the entrypoint in `src/app.tsx`, see
[Atomic CSS](/guides/atomic-css/). Global styles imported before it can declare the layer order and
put themselves into a lower layer, like the examples do:

```css title="src/app.css"
@layer theme, base, components, utilities;

@layer base {
  body {
    font-family: sans-serif;
  }
}
```

```tsx title="src/app.tsx"
import "./app.css";
import "@style-this/core/atomic";
```

## Examples

- [`vite-solid`](https://github.com/shiro/style-this/tree/master/examples/vite-solid) (SolidStart 1)
- [`vite-solid-start-2`](https://github.com/shiro/style-this/tree/master/examples/vite-solid-start-2)
