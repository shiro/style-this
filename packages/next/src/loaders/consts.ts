import { createRequire } from "node:module";
import path from "path";
import type { VirtualImportKind } from "@style-this/core/compiler";
import { noopFileImport, transformExtensions, type LoaderConfig } from "@style-this/webpack/core";

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

// the pages router only allows global CSS imports from `_app`
const regexPagesApp = new RegExp(`[\\\\/]pages[\\\\/]_app\\.(${transformExtensions.join("|")})$`);
const cssQualifier = (filepath: string) => (regexPagesApp.test(filepath) ? "global" : "module");

const resolveVirtualImport = (kind: VirtualImportKind, filepath: string) =>
  noopFileImport(kind === "css" ? noopCssFiles[cssQualifier(filepath)] : noopAtomicProgramFile, filepath);

type Bundler = "webpack" | "turbopack";

/** Turbopack passes loader options as JSON, so they must be serializable. */
export type LoaderOptions = { bundler: Bundler; atomic: boolean };

/** The loaders are shared by both bundlers, they're told which one with the `bundler` option. */
export const loaderConfig = ({ bundler, atomic }: LoaderOptions): LoaderConfig => ({
  key: `${bundler}:${atomic}`,
  atomic,
  resolveVirtualImport,
  useRequire: bundler === "turbopack",
});
