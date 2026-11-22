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

/** Toggled with `ATOMIC=1`, loaders run in processes that inherit the environment. */
export const atomic = process.env.ATOMIC === "1";

/**
 * `@style-this/core/atomic` resolves to one of these. The atomic CSS is served with the CSS of each
 * file, so the entrypoint only fixes the layer order in atomic mode.
 */
export const noopAtomicCssFilename = atomic ? "style-this.atomic-layers.css" : "style-this.atomic.css";
export const noopAtomicCssFile = path.join(packageRoot, noopAtomicCssFilename);

/** The atomic class modules of transformed files point at this, the loader serves the module of `?filepath=`. */
export const noopAtomicProgramFile = path.join(packageRoot, "style-this.atomic-program.js");

export const regexNoopCss = /[\\/]style-this\.(module|global)\.css$/;

// the pages router only allows global CSS imports from `_app`
const cssQualifier = (filepath: string) =>
  /[\\/]pages[\\/]_app\.[jt]sx?$/.test(filepath) ? "global" : "module";

const resolveVirtualImport = (kind: VirtualImportKind, filepath: string) =>
  noopFileImport(kind === "css" ? noopCssFiles[cssQualifier(filepath)] : noopAtomicProgramFile, filepath);

type Bundler = "webpack" | "turbopack";

const loaderConfigs: Record<Bundler, LoaderConfig> = {
  webpack: { key: "webpack", atomic, resolveVirtualImport },
  turbopack: { key: "turbopack", atomic, resolveVirtualImport, useRequire: true },
};

type LoaderOptions = { bundler?: Bundler };

/** The virtual module loaders are shared by both bundlers, they're told which one with the `bundler` option. */
export const loaderConfig = ({ bundler = "webpack" }: LoaderOptions) => loaderConfigs[bundler];
