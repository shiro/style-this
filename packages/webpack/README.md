# @style-this/webpack

webpack 5 plugin for [style-this](https://style-this.usagi.io), zero-runtime CSS-in-JS. For Next.js use
[`@style-this/next`](https://www.npmjs.com/package/@style-this/next), which is built on this package.

```bash
pnpm add @style-this/core
pnpm add -D @style-this/webpack
```

```js
// webpack.config.js
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { StyleThisPlugin } from "@style-this/webpack";

export default {
  module: {
    rules: [
      { test: /\.[jt]sx?$/, loader: "esbuild-loader", options: { jsx: "automatic" } },
      // the generated CSS is imported as `.css` files
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
    ],
  },
  plugins: [new StyleThisPlugin({ atomic: false }), new MiniCssExtractPlugin()],
};
```

Documentation: [style-this.usagi.io/reference/next-webpack/](https://style-this.usagi.io/reference/next-webpack/)
