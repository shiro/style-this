---
title: Next.js
description: Use style-this with the Next.js app and pages routers, on webpack or turbopack.
sidebar:
  order: 4
  badge:
    text: Beta
    variant: caution
slug: 0.5/frameworks/next
---

```bash
pnpm add @style-this/core @style-this/react @style-this/next
```

```js title="next.config.mjs"
import { withStyleThis } from "@style-this/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your config
};

export default withStyleThis(nextConfig);
```

`withStyleThis` registers the loaders for both webpack and turbopack, Next.js uses whichever
bundler it's running with. An existing `webpack` function in your config keeps working.

## Usage

Works in both server and client components, with the app router and the pages router.

```tsx title="app/layout.tsx"
import { css } from "@style-this/core";

const wrapper = css`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={wrapper}>{children}</div>
      </body>
    </html>
  );
}
```

## Atomic mode

[Atomic mode](/0.5/guides/atomic-css/) is enabled with the `ATOMIC` environment variable:

```json title="package.json"
{
  "scripts": {
    "dev": "next dev",
    "dev:atomic": "ATOMIC=1 next dev"
  }
}
```

## Limitations

* With turbopack only `.tsx` files are transformed. With webpack `.ts`, `.tsx`, `.js`, `.jsx` and
  `.mjs` files outside `node_modules` are.
* `middleware.ts` is skipped under turbopack.
* `withStyleThis` currently takes no style-this specific options.

Example (app router and pages router):
[`next`](https://github.com/shiro/style-this/tree/master/examples/next).
