import path from "path";
import { fileURLToPath } from "url";
import { WithLinariaConfig } from "./types";
import { regexFilepathQuery } from "./loaders/consts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function addTurbopackConfig(config: WithLinariaConfig): WithLinariaConfig {
  const transformLoader = {
    loader: path.resolve(__dirname, "./loaders/turbopackTransformLoader.mjs"),
    options: {},
  };

  // serves the CSS of `?filepath=` for the noop CSS files the transformed files import
  const cssRule = {
    condition: { query: regexFilepathQuery },
    // plain CSS, CSS modules would rename the classes and the pages router accepts it outside `_app`
    type: "css" as const,
    loaders: [
      { loader: path.resolve(__dirname, "./loaders/cssLoader.mjs"), options: { bundler: "turbopack" } },
    ],
  };

  return {
    ...config,
    turbopack: {
      ...config.turbopack,
      resolveAlias: {
        ...config.turbopack?.resolveAlias,
        "@style-this/core/atomic": "@style-this/next/style-this.atomic.css",
      },
      rules: {
        ...config.turbopack?.rules,
        // "*.{ts,tsx,js,jsx}": {
        "*.tsx": {
          condition: {
            // TODO: can be removed once https://github.com/vercel/next.js/issues/79592 is fixed
            not: { path: /middleware\.(tsx?|jsx?)$/ },
          },
          loaders: [transformLoader],
        },
        "style-this.module.css": cssRule,
        "style-this.global.css": cssRule,
      },
    },
  };
}
