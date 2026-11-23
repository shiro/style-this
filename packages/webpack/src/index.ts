import path from "path";
import { fileURLToPath } from "url";
import type { Compiler } from "webpack";
import {
  noopAtomicCssFile,
  regexFilepathQuery,
  regexNoopAtomicProgram,
  regexNoopCss,
  transformRuleConditions,
  webpackLoaderConfig,
  type LoaderOptions,
} from "./loaders/consts";
import { dropRemovedFiles } from "./loaders/transform";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type StyleThisPluginOptions = LoaderOptions;

/**
 * Transforms the JS/TS modules outside `node_modules`. Their CSS is imported as `.css` files, so it
 * goes through the CSS rules of the config (e.g. `css-loader` with `mini-css-extract-plugin`).
 */
export class StyleThisPlugin {
  constructor(private options: StyleThisPluginOptions = {}) {}

  apply(compiler: Compiler) {
    const { module, resolve } = compiler.options;
    const options = this.options;

    resolve.alias = {
      ...(resolve.alias as Record<string, string>),
      "@style-this/core/atomic$": noopAtomicCssFile(options.atomic ?? false),
    };

    // runs before the loaders of the config's rules for the same files
    module.rules.push(
      {
        test: regexNoopCss,
        resourceQuery: regexFilepathQuery,
        loader: path.resolve(__dirname, "./loaders/cssLoader.mjs"),
        options,
      },
      {
        test: regexNoopAtomicProgram,
        resourceQuery: regexFilepathQuery,
        loader: path.resolve(__dirname, "./loaders/atomicProgramLoader.mjs"),
        options,
      },
      {
        ...transformRuleConditions,
        loader: path.resolve(__dirname, "./loaders/transformLoader.mjs"),
        options,
      },
    );

    dropRemovedFiles(compiler, webpackLoaderConfig(options));
  }
}
