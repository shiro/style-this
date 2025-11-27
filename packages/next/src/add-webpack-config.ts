import type { NextConfig } from "next";
import path from "path";
import type * as NextServer from "next/dist/server/config-shared";
import type * as Webpack from "webpack";

import { regexLinariaCSS, regexLinariaCSSQuery } from "./loaders/consts";
import { isCssLoader, isCssModule } from "./utils/webpack-utils";

const cssLoader = path.resolve(__dirname, "./loaders/webpackCssLoader.mjs");
const transformLoader = path.resolve(
  __dirname,
  "./loaders/webpackTransformLoader.mjs",
);

/**
 * Modify the css loader config to support linaria global css and prevent
 * the default css-loader from generating classnames for linaria modules.
 */
function modifyCssLoaderConfig(rules: Webpack.RuleSetRule[]) {
  for (const rule of rules) {
    if (!rule) continue;
    if (isCssLoader(rule)) {
      if (isCssModule(rule)) {
        const nextGetLocalIdent = rule.options.modules.getLocalIdent;
        // we don't want the default css-loader to generate classnames,
        // as we generate those ourselves
        rule.options.modules.getLocalIdent = (
          context,
          _,
          exportName,
          ...rest
        ) => {
          if (regexLinariaCSSQuery.test(context.resourceQuery)) {
            return exportName;
          }
          return nextGetLocalIdent(context, _, exportName, ...rest);
        };
      }
    }
    if (typeof rule.use === "object") {
      const useRules = rule.use as Webpack.RuleSetRule | Webpack.RuleSetRule[];
      modifyCssLoaderConfig(Array.isArray(useRules) ? useRules : [useRules]);
    }
    if (Array.isArray(rule.oneOf)) {
      modifyCssLoaderConfig(rule.oneOf as Webpack.RuleSetRule[]);
    }
  }
}

export type LinariaConfig = NextConfig;

export function addWebpackConfig({ ...nextConfig }: LinariaConfig) {
  const webpack = (
    config: Webpack.Configuration,
    options: NextServer.WebpackConfigContext,
  ) => {
    if (config.module?.rules && config.plugins) {
      modifyCssLoaderConfig(config.module.rules as Webpack.RuleSetRule[]);

      config.module.rules.push({
        test: regexLinariaCSS,
        loader: cssLoader,
        options: {},
        exclude: /node_modules/,
      });

      config.module.rules.push({
        test: [/\.(tsx|ts|js|mjs|jsx)$/],
        loader: transformLoader,
        options: {},
        exclude: /node_modules/,
      });
    }

    if (typeof nextConfig.webpack === "function") {
      return nextConfig.webpack(config, options);
    }
    return config;
  };

  return {
    ...nextConfig,
    webpack,
  };
}
