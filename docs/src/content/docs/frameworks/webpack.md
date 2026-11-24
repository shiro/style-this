---
title: webpack
description: Use style-this in a custom webpack 5 setup.
sidebar:
  order: 5
---

For Next.js use [`@style-this/next`](/frameworks/next/), which is built on this plugin.

## Setup

```bash
pnpm add @style-this/core
pnpm add -D @style-this/webpack
```

```js title="webpack.config.js"
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { StyleThisPlugin } from "@style-this/webpack";

export default {
  entry: "./src/main.tsx",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      { test: /\.[jt]sx?$/, loader: "esbuild-loader", options: { jsx: "automatic" } },
      // also handles the CSS of the transformed files
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
    ],
  },
  plugins: [
    new StyleThisPlugin(),
    new HtmlWebpackPlugin({ template: "./index.html" }),
    new MiniCssExtractPlugin(),
  ],
};
```

`StyleThisPlugin` transforms `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` and `.cts` files outside
`node_modules` before the loaders of your own rules (e.g. `esbuild-loader` or `babel-loader`) see them.

The generated CSS is imported as `.css` files, so it goes through **your CSS rule**, e.g.
`css-loader` with `mini-css-extract-plugin` as above.

## Usage

Write styles with `css`, or with `styled` from [`@style-this/react`](/frameworks/react/) or
[`@style-this/solid`](/frameworks/solid/), as with any other bundler.

```tsx title="src/App.tsx"
import { css } from "@style-this/core";

const app = css`
  display: flex;
  flex-direction: column;
`;

export const App = () => <main className={app}>Hello</main>;
```

## Atomic mode

```js title="webpack.config.js"
new StyleThisPlugin({ atomic: process.env.ATOMIC === "1" });
```

Import the atomic entrypoint in your root module:

```tsx title="src/App.tsx"
import "@style-this/core/atomic";
```

Every file's stylesheet includes the atomic CSS it uses, the entrypoint fixes the
[layer order](/guides/atomic-css/#cascade-layers). See [Atomic CSS](/guides/atomic-css/).

## Limitations

- No `ignoredImports` or `debug` options, see the
  [plugin reference](/reference/next-webpack/#style-thiswebpack).
- No CSS source maps, see [HMR & source maps](/guides/hmr-and-sourcemaps/#source-maps).

## Example

[`examples/webpack`](https://github.com/shiro/style-this/tree/master/examples/webpack)
