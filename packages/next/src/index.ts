import { addTurbopackConfig } from "./addTurbopackConfig";
import { addWebpackConfig } from "./addWebpackConfig";
import type { WithLinariaConfig } from "./types";

export type LinariaConfig = WithLinariaConfig;

export function withStyleThis(config: WithLinariaConfig) {
  // Apply both webpack and turbopack configs
  // Next.js will use whichever bundler it's configured to use
  let updatedConfig = addWebpackConfig(config);
  updatedConfig = addTurbopackConfig(updatedConfig);
  return updatedConfig;
}
