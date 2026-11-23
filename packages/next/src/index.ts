import { addTurbopackConfig } from "./addTurbopackConfig";
import { addWebpackConfig } from "./addWebpackConfig";
import type { NextConfig } from "next";
import type { StyleThisNextOptions, WithLinariaConfig } from "./types";

export type LinariaConfig = WithLinariaConfig;
export type { StyleThisNextOptions };

export function withStyleThis(config: WithLinariaConfig, { atomic = false }: StyleThisNextOptions = {}) {
  // Apply both webpack and turbopack configs
  // Next.js will use whichever bundler it's configured to use
  const updatedConfig: NextConfig = addWebpackConfig(config, atomic);
  return addTurbopackConfig(updatedConfig, atomic);
}
