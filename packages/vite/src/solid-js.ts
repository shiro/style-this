import { Plugin, UserConfig } from "vite";
import {
  SolidJsTransformer,
  initializeStyleThisCompiler,
} from "@style-this/core/compiler";

type Filter = RegExp | ((filepath: string) => boolean);

interface Options {
  filter?: Filter | Filter[];
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> {}

const vitePlugin = (options: Options = {}) => {
  let { filter = [] } = options;

  if (!Array.isArray(filter)) filter = [filter];

  let transformer: SolidJsTransformer;

  return {
    name: "vite:style-this:solid-js",
    enforce: "pre",

    async config(config: ViteConfig) {
      await initializeStyleThisCompiler();

      transformer = new SolidJsTransformer();
    },

    async transform(code, filepath) {
      if (
        !filepath ||
        filepath.includes("/node_modules/") ||
        (!filepath.endsWith(".tsx") && !filepath.endsWith(".jsx"))
      )
        return;

      if (
        filter.length != 0 &&
        !filter.some((filter) =>
          filter instanceof RegExp ? filter.test(filepath) : filter(filepath),
        )
      ) {
        return;
      }

      try {
        const transformedResult = await transformer.transform(code, filepath);

        return {
          code: transformedResult.code,
          map: transformedResult.sourcemap,
        };
      } catch (err) {
        if (!(err instanceof Error)) throw err;

        // vite doesn't print cause, add it to the message
        if (err.cause) err.message += `\nCause:\n${err.cause}`;

        throw err;
      }
    },
  } satisfies Plugin;
};

export default vitePlugin;
