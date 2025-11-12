import { Plugin, UserConfig } from "vite";

type Filter = RegExp | ((filepath: string) => boolean);

interface Options {
  filter?: Filter | Filter[];
}

interface ViteConfig extends Pick<UserConfig, "optimizeDeps"> {}

const vitePlugin = (options: Options = {}) => {
  let { filter = [] } = options;

  if (!Array.isArray(filter)) filter = [filter];

  return {
    name: "vite:style-this:solid-js",

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
    },
  } satisfies Plugin;
};

export default vitePlugin;
