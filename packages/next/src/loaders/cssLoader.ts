import { cssFiles } from "../shared";
import { atomic } from "./consts";
import { cssExtension, fileAtomicCss, loadVirtualModule, virtualModuleLoader } from "./transform";

/** Serves the CSS of the file in `?filepath=`, in atomic mode including the atomic CSS it uses. */
export default virtualModuleLoader(async (ctx, bundler, filepath) => {
  const css = await loadVirtualModule(ctx, bundler, filepath, cssFiles, `${filepath}.${cssExtension}`);
  // there's no hook to collect the atomic CSS of all files (Turbopack also runs loaders in several
  // processes), every file's CSS includes the atomic CSS it uses instead
  const atomicCss = atomic ? await fileAtomicCss(bundler, filepath) : "";
  return [css, atomicCss].filter(Boolean).join("\n");
});
