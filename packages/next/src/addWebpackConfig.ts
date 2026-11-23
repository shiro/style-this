import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import type * as NextServer from "next/dist/server/config-shared";
import type * as Webpack from "webpack";

import {
  regexFilepathQuery,
  regexNoopAtomicProgram,
  transformRuleConditions,
} from "@style-this/webpack/core";
import { noopAtomicCssFile, regexNoopCss } from "./loaders/consts";
import { isCssLoader, isCssModule } from "./utils/webpack-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
          if (regexNoopCss.test(context.resourcePath)) {
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

      config.resolve ??= {};
      config.resolve.alias = {
        ...(config.resolve.alias as Record<string, string>),
        "@style-this/core/atomic$": noopAtomicCssFile,
      };

      config.module.rules.push({
        test: regexNoopCss,
        resourceQuery: regexFilepathQuery,
        loader: path.resolve(__dirname, "./loaders/cssLoader.mjs"),
        options: {},
      });

      config.module.rules.push({
        test: regexNoopAtomicProgram,
        resourceQuery: regexFilepathQuery,
        loader: path.resolve(__dirname, "./loaders/atomicProgramLoader.mjs"),
        options: {},
      });

      config.module.rules.push({
        ...transformRuleConditions,
        // Next's own queries, e.g. the pages of the edge runtime are imported with `?__next_edge_ssr_entry__`
        resourceQuery: [transformRuleConditions.resourceQuery, /^\?__next_\w+__$/],
        loader: path.resolve(__dirname, "./loaders/webpackTransformLoader.mjs"),
        options: {},
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
