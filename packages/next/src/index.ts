import { addTurbopackConfig } from "./addTurbopackConfig";
import { addWebpackConfig } from "./addWebpackConfig";
import type { NextConfig } from "next";
import type { StyleThisNextOptions, WithLinariaConfig } from "./types";
import { defaultPageExtensions } from "./loaders/consts";

export type LinariaConfig = WithLinariaConfig;
export type { StyleThisNextOptions };

export function withStyleThis(config: WithLinariaConfig, { atomic = false }: StyleThisNextOptions = {}) {
  // Apply both webpack and turbopack configs
  // Next.js will use whichever bundler it's configured to use
  const options = { atomic, pageExtensions: config.pageExtensions ?? defaultPageExtensions };
  const updatedConfig: NextConfig = addWebpackConfig(config, options);
  return addTurbopackConfig(updatedConfig, options);
}
