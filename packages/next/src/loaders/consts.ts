import { createRequire } from "node:module";
import path from "path";
import type { VirtualImportKind } from "@style-this/core/compiler";

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

/** Extensions of the files the transform loader runs on. */
export const transformExtensions = ["tsx", "ts", "jsx", "js", "mjs"];
export const regexTransformExtension = new RegExp(`\\.(${transformExtensions.join("|")})$`);

export const regexNoopCss = /[\\/]style-this\.(module|global)\.css$/;
export const regexNoopAtomicProgram = /[\\/]style-this\.atomic-program\.js$/;
export const regexFilepathQuery = /[?&]filepath=/;

// the pages router only allows global CSS imports from `_app`
const cssQualifier = (filepath: string) =>
  /[\\/]pages[\\/]_app\.[jt]sx?$/.test(filepath) ? "global" : "module";

export const resolveVirtualImport = (kind: VirtualImportKind, filepath: string) => {
  const noopFile = kind === "css" ? noopCssFiles[cssQualifier(filepath)] : noopAtomicProgramFile;
  let noopFilepath = path.relative(path.dirname(filepath), noopFile);
  if (!noopFilepath.startsWith(".")) noopFilepath = `./${noopFilepath}`;
  return `${noopFilepath}?filepath=${encodeURIComponent(filepath)}`;
};

const atomicLayerOrder = "@layer theme, base, components, utilities;";
/** Same layers as the vite plugin's atomic CSS, see `rank_layered_atomic_css` for the nested ones. */
export const wrapAtomicCss = (css: string) => `${atomicLayerOrder}\n@layer utilities {\n${css}\n}`;
