import path from "path";
import { fileURLToPath } from "url";
import { WithLinariaConfig } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  // Don't add cssLoader for turbopack - it causes issues with regular CSS files
  // The transform loader handles injecting the virtual CSS imports

  return config;
}
