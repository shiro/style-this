import type { CssCachEntry, JsCacheRegistry } from "@style-this/core/compiler";

export const cssFiles = new Map<string, CssCachEntry>();
export const atomicFiles = new Map<string, CssCachEntry>();

/** Makes the compiler resolve CSS into `cssFiles` and atomic class modules into `atomicFiles`, where the loaders read them from. */
export const cacheRegistry: JsCacheRegistry = {
  initializeRefs(cssRef, atomicRef) {
    Object.assign(globalThis, { [cssRef]: cssFiles, [atomicRef]: atomicFiles });
  },
};
