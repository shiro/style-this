---
title: React (Vite)
description: Use style-this in a Vite + React app.
sidebar:
  order: 1
---

For React with Next.js see [Next.js](/frameworks/next/), with a custom webpack setup see
[webpack](/frameworks/webpack/).

## Setup

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
    styleThis({ filter: /\.tsx$/ }),
  ],
  css: { devSourcemap: true }, // CSS source maps in dev
});
```

The plugin runs with `enforce: "pre"`, its position relative to `react()` doesn't matter.

## Usage

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

Styled components forward `ref` to their element, on React 18 and 19.

## Atomic mode

Set `atomic: true` and import the entrypoint in your root component, see
[Atomic CSS](/guides/atomic-css/).

```tsx title="src/App.tsx"
import "@style-this/core/atomic";
```

## Example

[`examples/vite-react`](https://github.com/shiro/style-this/tree/master/examples/vite-react)
