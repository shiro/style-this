---
title: Next.js
description: Use style-this with the Next.js app and pages routers, on Turbopack or webpack.
sidebar:
  order: 4
  badge:
    text: Beta
    variant: caution
---

Requires Next.js 16.2 or newer.

## Setup

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

`withStyleThis` registers the loaders for both Turbopack and webpack (`next dev --webpack`), Next.js
uses whichever bundler it's running with. Your own config is kept: an existing `webpack` function
is still called and your `turbopack.rules` are kept.

## Usage

Styles work in server and client components, with the app router and the pages router, in
`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` and `.cts` files outside `node_modules`.

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

The generated CSS is plain global CSS, so styles can be defined in any component, including pages
router components outside `_app`.

## Atomic mode

Atomic mode is enabled with the `atomic` option:

```js title="next.config.mjs"
export default withStyleThis(nextConfig, { atomic: true });
```

Import the atomic entrypoint in the root layout, and in `pages/_app` if you use the pages router:

```tsx title="app/layout.tsx"
import "./app.css";
import "@style-this/core/atomic";
```

Every file's stylesheet includes the atomic CSS it uses, the entrypoint fixes the
[layer order](/guides/atomic-css/#cascade-layers). See [Atomic CSS](/guides/atomic-css/).

## Limitations

- `withStyleThis` only takes the `atomic` option, `ignoredImports` and `debug` aren't
  available.
- No CSS source maps, see [HMR & source maps](/guides/hmr-and-sourcemaps/#source-maps).

## Example

[`examples/next`](https://github.com/shiro/style-this/tree/master/examples/next) uses the app router
and the pages router side by side.
