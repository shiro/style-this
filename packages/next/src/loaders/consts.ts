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

/** `@style-this/core/atomic` resolves to this empty stylesheet, atomic mode isn't supported yet. */
export const noopAtomicCssFile = path.join(packageRoot, "style-this.atomic.css");

export const regexNoopCss = /[\\/]style-this\.(module|global)\.css$/;
export const regexFilepathQuery = /[?&]filepath=/;

// the pages router only allows global CSS imports from `_app`
const cssQualifier = (filepath: string) =>
  /[\\/]pages[\\/]_app\.[jt]sx?$/.test(filepath) ? "global" : "module";

export const resolveVirtualImport = (kind: VirtualImportKind, filepath: string) => {
  // the transformer isn't atomic, the other virtual modules are atomic only
  if (kind !== "css") throw new Error(`unexpected virtual import '${kind}'`);

  let noopFilepath = path.relative(path.dirname(filepath), noopCssFiles[cssQualifier(filepath)]);
  if (!noopFilepath.startsWith(".")) noopFilepath = `./${noopFilepath}`;
  return `${noopFilepath}?filepath=${encodeURIComponent(filepath)}`;
};
