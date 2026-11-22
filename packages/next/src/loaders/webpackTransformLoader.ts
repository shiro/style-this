import { createTransformLoader } from "@style-this/webpack/core";
import { loaderConfig } from "./consts";

export default createTransformLoader(() => loaderConfig({ bundler: "webpack" }));
