import path from "path";
import { fileURLToPath } from "url";
import type {
  TurbopackRuleConfigCollection,
  TurbopackRuleConfigItem,
} from "next/dist/server/config-shared";
import { WithLinariaConfig } from "./types";
import {
  regexFilepathQuery,
  regexNoopAtomicProgram,
  transformExtensions,
} from "@style-this/webpack/core";
import { noopAtomicCssFilename } from "./loaders/consts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transformGlob = `*.{${transformExtensions.join(",")}}`;

/**
 * Runs `rule` after the user's rules of the same glob instead of overwriting them. Next turns each
 * item of an array (rule or loader) into its own rule.
 */
const appendRule = (
  userRule: TurbopackRuleConfigCollection | undefined,
  rule: TurbopackRuleConfigItem,
): TurbopackRuleConfigCollection =>
  userRule ? [...(Array.isArray(userRule) ? userRule : [userRule]), rule] : rule;

export function addTurbopackConfig(config: WithLinariaConfig): WithLinariaConfig {
  const userRules = config.turbopack?.rules;

  const transformRule: TurbopackRuleConfigItem = {
    condition: {
      all: [
        // same as the `node_modules` exclusion of the webpack rule
        { not: "foreign" },
        { not: { path: regexNoopAtomicProgram } },
        // TODO: can be removed once https://github.com/vercel/next.js/issues/79592 is fixed
        { not: { path: new RegExp(`middleware\\.(${transformExtensions.join("|")})$`) } },
      ],
    },
    loaders: [
      { loader: path.resolve(__dirname, "./loaders/turbopackTransformLoader.mjs"), options: {} },
    ],
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
        "@style-this/core/atomic": `@style-this/next/${noopAtomicCssFilename}`,
      },
      rules: {
        ...userRules,
        [transformGlob]: appendRule(userRules?.[transformGlob], transformRule),
        "style-this.module.css": cssRule,
        "style-this.global.css": cssRule,
        // serves the atomic class module of `?filepath=`
        "style-this.atomic-program.js": {
          condition: { query: regexFilepathQuery },
          loaders: [
            {
              loader: path.resolve(__dirname, "./loaders/atomicProgramLoader.mjs"),
              options: { bundler: "turbopack" },
            },
          ],
        },
      },
    },
  };
}
