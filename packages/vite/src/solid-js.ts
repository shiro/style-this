import { Plugin } from "vite";
import {
  SolidJsTransformer,
  initializeStyleThis,
} from "@style-this/core/compiler";
import { Filter, filterMatches, handleTransformError } from "./util";
import * as CompilerPlugin from ".";

interface Options {
  filter?: Filter | Filter[];
}

const vitePlugin = (options: Options = {}) => {
  let { filter = [] } = options;

  if (!Array.isArray(filter)) filter = [filter];

  let transformer: SolidJsTransformer;

  return {
    name: "vite:style-this:solid-js",
    enforce: "pre",

    async config(config) {
      await initializeStyleThis();

      transformer = new SolidJsTransformer();

      const compilerPlugin = config.plugins?.find((p) => {
        if (!p || typeof p != "object" || !p.hasOwnProperty("name")) return;
        return (p as any).name == "vite:style-this";
      }) as (Plugin & CompilerPlugin.ExtraFields) | undefined;

      if (!compilerPlugin)
        throw new Error(
          "failed to find 'styleThisVitePlugin', is it included in 'config.plugins'?",
        );

      const solidMock = `
export const template = () => () => {};
export const spread = () => {};
export const mergeProps = () => {};
`;
      compilerPlugin.__mocks.set("solid-js/web", solidMock);
    },

    async transform(code, filepath) {
      if (
        !filepath ||
        filepath.includes("/node_modules/") ||
        (!filepath.endsWith(".tsx") && !filepath.endsWith(".jsx"))
      )
        return;

      if (!filterMatches(filter, filepath)) {
        return;
      }

      try {
        const transformedResult = await transformer.transform(code, filepath);

        return {
          code: transformedResult.code,
          map: transformedResult.sourcemap,
        };
      } catch (err) {
        handleTransformError(err);
      }
    },
  } satisfies Plugin;
};

export default vitePlugin;
