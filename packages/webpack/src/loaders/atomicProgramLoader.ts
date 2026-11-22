import { createAtomicProgramLoader } from "./transform";
import { webpackLoaderConfig } from "./consts";

export default createAtomicProgramLoader(webpackLoaderConfig);
