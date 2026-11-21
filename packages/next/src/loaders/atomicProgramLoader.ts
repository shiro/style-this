import { atomicFiles } from "../shared";
import { atomicProgramExtension, loadVirtualModule, virtualModuleLoader } from "./transform";

/** Serves the atomic class module of the file in `?filepath=`. */
export default virtualModuleLoader((ctx, bundler, filepath) =>
  loadVirtualModule(ctx, bundler, filepath, atomicFiles, `${filepath}.${atomicProgramExtension}`),
);
