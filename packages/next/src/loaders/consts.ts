import { existsSync } from "fs";
import { createRequire } from "node:module";
import path from "path";
import type { VirtualImportKind } from "@style-this/core/compiler";
import { noopFileImport, type LoaderConfig } from "@style-this/webpack/core";

const packageRoot = path.dirname(
  createRequire(import.meta.url).resolve("@style-this/next/package.json"),
);

/** Empty files the generated CSS imports point at, the CSS loader serves the CSS of `?filepath=`. */
export const noopCssFiles = {
  module: path.join(packageRoot, "style-this.module.css"),
  global: path.join(packageRoot, "style-this.global.css"),
};

/**
 * `@style-this/core/atomic` resolves to one of these. The atomic CSS is served with the CSS of each
 * file, so the entrypoint only fixes the layer order in atomic mode.
 */
export const noopAtomicCssFilename = (atomic: boolean) =>
  atomic ? "style-this.atomic-layers.css" : "style-this.atomic.css";
export const noopAtomicCssFile = (atomic: boolean) => path.join(packageRoot, noopAtomicCssFilename(atomic));

/** The atomic class modules of transformed files point at this, the loader serves the module of `?filepath=`. */
export const noopAtomicProgramFile = path.join(packageRoot, "style-this.atomic-program.js");

export const regexNoopCss = /[\\/]style-this\.(module|global)\.css$/;

/** Next's default `pageExtensions`. */
export const defaultPageExtensions = ["tsx", "ts", "jsx", "js"];

// like Next's `findPagesDir`, `pages` takes precedence over `src/pages`
const findPagesDir = (dir: string) =>
  [path.join(dir, "pages"), path.join(dir, "src", "pages")].find((pagesDir) => existsSync(pagesDir));

type Bundler = "webpack" | "turbopack";

/** Turbopack passes loader options as JSON, so they must be serializable. */
export type LoaderOptions = { bundler: Bundler; atomic: boolean; pageExtensions: string[] };

// computed once per project, the loaders get the config of every file
const configs = new Map<string, LoaderConfig>();

/** The loaders are shared by both bundlers, they're told which one with the `bundler` option. */
export const loaderConfig = (
  { bundler, atomic, pageExtensions }: LoaderOptions,
  rootContext: string,
): LoaderConfig => {
  const cacheKey = `${bundler}:${atomic}:${pageExtensions}:${rootContext}`;
  const cached = configs.get(cacheKey);
  if (cached) return cached;

  // the pages router only allows global CSS imports from the custom App, like Next's `findPageFile`
  // `_app` or `_app/index` with a page extension
  const pagesDir = findPagesDir(rootContext);
  const appFiles = pagesDir
    ? pageExtensions.flatMap((ext) => [path.join(pagesDir, `_app.${ext}`), path.join(pagesDir, "_app", `index.${ext}`)])
    : [];

  const config: LoaderConfig = {
    key: `${bundler}:${atomic}:${pagesDir}:${pageExtensions}`,
    atomic,
    resolveVirtualImport: (kind: VirtualImportKind, filepath: string) =>
      noopFileImport(
        kind === "css" ? noopCssFiles[appFiles.includes(filepath) ? "global" : "module"] : noopAtomicProgramFile,
        filepath,
      ),
    useRequire: bundler === "turbopack",
  };
  configs.set(cacheKey, config);
  return config;
};
