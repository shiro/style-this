---
title: SolidJS & SolidStart
description: Use style-this with SolidJS, SolidStart 1 (vinxi) and SolidStart 2.
sidebar:
  order: 2
slug: 0.4/frameworks/solid
---

```bash
pnpm add @style-this/core @style-this/solid
pnpm add -D @style-this/vite
```

## Vite + Solid

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [styleThis({ filter: /\.tsx$/ }), solid()],
});
```

## SolidStart 2

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

## SolidStart 1 (vinxi)

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

Dynamic expressions are reactive: they re-run whenever the signals or props they read change.

## SSR

The plugin keeps `@style-this/core` out of Vite's SSR externals automatically, so the
`@style-this/core/atomic` import resolves on the server too. For atomic mode put the import in
`src/app.tsx`.

Examples:
[`vite-solid`](https://github.com/shiro/style-this/tree/master/examples/vite-solid) (SolidStart 1),
[`vite-solid-start-2`](https://github.com/shiro/style-this/tree/master/examples/vite-solid-start-2).
