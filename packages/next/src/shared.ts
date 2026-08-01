import type { CssCachEntry } from "@style-this/core/compiler";

export const cssFiles = new Map<string, CssCachEntry>();
export const dependencyStore = new Map<string, string[]>();
