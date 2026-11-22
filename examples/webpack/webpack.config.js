import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { StyleThisPlugin } from "@style-this/webpack";

/** @type {import("webpack").Configuration} */
export default {
  entry: "./src/main.tsx",
  output: {
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: "esbuild-loader",
        options: { jsx: "automatic" },
      },
      // also handles the CSS of the transformed files
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new StyleThisPlugin({ atomic: process.env.ATOMIC === "1" }),
    new HtmlWebpackPlugin({ template: "./index.html" }),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    // readable build output
    minimize: false,
    splitChunks: {
      cacheGroups: {
        vendors: { test: /[\\/]node_modules[\\/]/, name: "vendors", chunks: "all" },
      },
    },
  },
  performance: false,
  devServer: {
    port: 3000,
  },
};
