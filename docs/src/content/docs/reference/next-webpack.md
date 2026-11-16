---
title: "@style-this/next & @style-this/webpack"
description: Next.js and webpack integration reference.
sidebar:
  order: 4
  label: "@style-this/next · webpack"
---

## `@style-this/next`

```ts
import { withStyleThis } from "@style-this/next";

withStyleThis(config: NextConfig): NextConfig
```

Wraps a Next.js config:

- **webpack**: adds the transform loader for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` outside
  `node_modules`, a CSS loader for the generated stylesheets, and keeps Next's CSS modules from
  renaming style-this classes. A user supplied `webpack` function is called afterwards.
- **turbopack**: adds `turbopack.rules` for `*.tsx` (excluding `middleware`), `*.module.css` and
  `*.global.css`.

| Environment variable | Effect |
| --- | --- |
| `ATOMIC=1` | enables [atomic mode](/guides/atomic-css/) |

## `@style-this/webpack`

:::caution
The standalone webpack package is experimental. It provides the low-level loader, there's no
turn-key plugin yet. For Next.js use `@style-this/next`.
:::

```ts
import styleThisLoader, { NextCSSLoader } from "@style-this/webpack";
```

| Export | Description |
| --- | --- |
| `default` | webpack 5 loader transforming JS/TS modules |
| `NextCSSLoader` | path of the companion loader that serves the generated CSS |

```ts
type LoaderOptions = {
  extension?: string;
  prefixer?: boolean;
  sourceMap?: boolean;
};
```

Peer dependency: `webpack ^5`.
