---
title: React (Vite)
description: Use style-this in a Vite + React app.
sidebar:
  order: 1
slug: 0.4/frameworks/react
---

```bash
pnpm add @style-this/core @style-this/react
pnpm add -D @style-this/vite
```

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [
    react(),
    styleThis({
      filter: /\.tsx$/,
      atomic: false,
    }),
  ],
  css: { devSourcemap: true },
});
```

The plugin runs with `enforce: "pre"`, its position relative to `react()` doesn't matter.

```tsx title="src/Counter.tsx"
import { useState } from "react";
import { css } from "@style-this/core";
import { styled } from "@style-this/react";

const wrapper = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button<{ pad: number }>`
  border: 1px solid blue;
  padding: ${({ pad }) => `${pad}px`};
  background: ${({ props }) => (props.disabled ? "red" : "green")};
`;

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className={wrapper}>
      {count}
      <Button
        styleProps={{ pad: 8 }}
        disabled={count >= 3}
        onClick={() => setCount(count + 1)}
      >
        count me
      </Button>
    </div>
  );
}
```

For atomic mode, add `import "@style-this/core/atomic"` to `src/App.tsx` or `src/main.tsx`, see
[Atomic CSS](/0.4/guides/atomic-css/).

A complete project lives in
[`examples/vite-react`](https://github.com/shiro/style-this/tree/master/examples/vite-react).
