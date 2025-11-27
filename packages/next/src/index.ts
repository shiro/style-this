import { addTurbopackConfig } from "./addTurbopackConfig";
import { addWebpackConfig } from "./addWebpackConfig";
import type { WithLinariaConfig } from "./types";

export type LinariaConfig = WithLinariaConfig;

export function withStyleThis(config: WithLinariaConfig) {
  const useTurbopack = process.env.TURBOPACK;
  if (useTurbopack) {
    // return addTurbopackConfig(config);
    // return config;
    throw new Error("turbopack is currently not supported");
  } else {
    return addWebpackConfig(config);
  }
}
