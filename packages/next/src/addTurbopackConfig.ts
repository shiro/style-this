import path from "path";
import { WithLinariaConfig } from "./types";

export function addTurbopackConfig(config: WithLinariaConfig) {
  config.turbopack ??= {};
  config.turbopack.rules ??= {};

  const loader = {
    loader: path.resolve(__dirname, "./loaders/turbopackTransformLoader.mjs"),
    options: {},
  };

  // config.turbopack.rules["*.{ts,tsx,js,jsx}"] = {
  config.turbopack.rules["*.tsx"] = {
    condition: {
      // TODO: can be removed once https://github.com/vercel/next.js/issues/79592 is fixed
      not: { path: /middleware\.(tsx?|jsx?)$/ },
    },
    loaders: [loader],
  };

  config.turbopack.rules["*.css"] = {
    loaders: [
      {
        loader: path.resolve(__dirname, "./loaders/cssLoader.mjs"),
        options: {},
      },
    ],
  };

  return config;
}
