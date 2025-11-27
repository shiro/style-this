import path from "path";
import { WithLinariaConfig } from "./types";

export function addTurbopackConfig({ ...config }: WithLinariaConfig) {
  config.turbopack ??= {};
  config.turbopack.rules ??= {};

  const loader = {
    loader: path.resolve(__dirname, "./loaders/turbopackTransformLoader"),
    options: {},
  };

  config.turbopack.rules["*.{ts,tsx,js,jsx}"] = {
    condition: {
      // TODO: can be removed once https://github.com/vercel/next.js/issues/79592 is fixed
      not: { path: /middleware\.(tsx?|jsx?)$/ },
    },
    loaders: [loader],
  };

  return config;
}
