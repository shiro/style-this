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

```ts
import { StyleThisPlugin } from "@style-this/webpack";

new StyleThisPlugin(options?: StyleThisPluginOptions)
```

Adds the transform loader for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` outside `node_modules`, which
runs before the loaders of your own rules (e.g. `esbuild-loader`, `babel-loader`), and the loaders
serving the generated CSS and atomic class modules.

The generated CSS is imported as `.css` files, so it goes through your CSS rule:

```js title="webpack.config.js"
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { StyleThisPlugin } from "@style-this/webpack";

export default {
  module: {
    rules: [
      { test: /\.[jt]sx?$/, loader: "esbuild-loader", options: { jsx: "automatic" } },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
    ],
  },
  plugins: [new StyleThisPlugin(), new MiniCssExtractPlugin()],
};
```

| Option | Default | Description |
| --- | --- | --- |
| `atomic` | `false` | enables [atomic mode](/guides/atomic-css/) |
| `useRequire` | `false` | same as the [vite option](/reference/vite/#userequire) |

In atomic mode, the CSS of every file includes the atomic rules it uses.

Peer dependency: `webpack ^5`.
