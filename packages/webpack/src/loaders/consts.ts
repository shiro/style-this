import { createRequire } from "node:module";
import path from "path";
import type { RuleSetRule } from "webpack";
import type { VirtualImportKind } from "@style-this/core/compiler";
import type { LoaderConfig } from "./transform";

const packageRoot = path.dirname(
  createRequire(import.meta.url).resolve("@style-this/webpack/package.json"),
);

/** Empty file the generated CSS imports point at, the CSS loader serves the CSS of `?filepath=`. */
export const noopCssFile = path.join(packageRoot, "style-this.css");

/** The atomic class modules of transformed files point at this, the loader serves the module of `?filepath=`. */
export const noopAtomicProgramFile = path.join(packageRoot, "style-this.atomic-program.js");

/**
 * `@style-this/core/atomic` resolves to this. The atomic CSS is served with the CSS of each file, so the
 * entrypoint only fixes the layer order in atomic mode.
 */
export const noopAtomicCssFile = (atomic: boolean) =>
  path.join(packageRoot, atomic ? "style-this.atomic-layers.css" : "style-this.atomic.css");

/** Extensions of the files the transform loader runs on, the ones the compiler parses. */
export const transformExtensions = ["tsx", "ts", "jsx", "js", "mjs", "cjs", "mts", "cts"];

export const regexNoopCss = /[\\/]style-this\.css$/;
export const regexNoopAtomicProgram = /[\\/]style-this\.atomic-program\.js$/;
export const regexFilepathQuery = /[?&]filepath=/;

/** The files the transform loader runs on. Like in vite, imports with a query (e.g. `?raw`) are skipped. */
export const transformRuleConditions = {
  test: new RegExp(`\\.(${transformExtensions.join("|")})$`),
  // also skips the `?filepath=` imports of the noop atomic program file
  resourceQuery: { not: [/./] },
  exclude: /[\\/]node_modules[\\/]/,
} satisfies RuleSetRule;

/**
 * Import of `noopFile` from `filepath`, its loader serves the virtual module of `filepath`. The query holds
 * `filepath` relative to `noopFile`, webpack keeps queries as-is in module identifiers (and the ids derived
 * from them), so these would otherwise depend on the project's location.
 */
export const noopFileImport = (noopFile: string, filepath: string) => {
  // absolute if they're on different drives on Windows
  let noopFilepath = path.relative(path.dirname(filepath), noopFile).replaceAll(path.sep, "/");
  if (!path.isAbsolute(noopFilepath) && !noopFilepath.startsWith("../")) noopFilepath = `./${noopFilepath}`;
  const query = path.relative(path.dirname(noopFile), filepath).replaceAll(path.sep, "/");
  return `${noopFilepath}?filepath=${encodeURIComponent(query)}`;
};

/** The `filepath` of a `noopFileImport` request, from the loader context of its noop file. */
export const noopFileImportFilepath = (resourcePath: string, resourceQuery: string) =>
  path.resolve(path.dirname(resourcePath), new URLSearchParams(resourceQuery).get("filepath")!);

export type LoaderOptions = { atomic?: boolean; useRequire?: boolean };

export const webpackLoaderConfig = ({ atomic = false, useRequire = false }: LoaderOptions): LoaderConfig => ({
  key: `webpack:${atomic}:${useRequire}`,
  atomic,
  useRequire,
  resolveVirtualImport: (kind: VirtualImportKind, filepath: string) =>
    noopFileImport(kind === "css" ? noopCssFile : noopAtomicProgramFile, filepath),
});
