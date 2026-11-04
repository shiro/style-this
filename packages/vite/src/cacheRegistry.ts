import { CssCachEntry } from "@style-this/core/compiler";

/**
 * TypeScript implementation of CacheRegistry for use in the Vite plugin.
 * 
 * Stores CSS and atomic program virtual module entries by their full virtual paths.
 * Supports both absolute and relative path lookups via basename matching.
 */
export class CacheRegistry {
  /**
   * Reference to the Rust CacheRegistry instance once initialized.
   * This is a pure Rust utility field - not accessed from TS code.
   */
  __native: any = undefined;

  /**
   * CSS cache storing virtual modules by their full path (e.g., /path/file.tsx.css)
   */
  private cssCache = new Map<string, CssCachEntry>();

  /**
   * Atomic cache storing .style-this.js modules by their full path
   */
  private atomicCache = new Map<string, CssCachEntry>();

  constructor() {
    // TS-side cache initialization
  }

  /**
   * Initialize the global cache references (called by Rust)
   * Stores our existing cache Maps in global scope so Rust can access them
   */
  initializeRefs(cssRef: string, atomicRef: string): void {
    const global = globalThis as any;
    global[cssRef] = this.cssCache;
    global[atomicRef] = this.atomicCache;
  }

  hasCssModule(filepath: string): boolean {
    return this.cssCache.has(filepath);
  }

  hasAtomicModule(filepath: string): boolean {
    return this.atomicCache.has(filepath);
  }

  /**
   * Get CSS module from cache by filepath (including .css extension)
   */
  getCssModule(filepath: string): CssCachEntry | undefined {
    return this.cssCache.get(filepath);
  }

  /**
   * Get atomic module from cache by filepath (including .style-this.js extension)
   */
  getAtomicModule(filepath: string): CssCachEntry | undefined {
    return this.atomicCache.get(filepath);
  }

  /**
   * Set CSS module in cache by full filepath (including .css extension)
   */
  setCssModule(filepath: string, value: CssCachEntry): void {
    this.cssCache.set(filepath, value);
  }

  /**
   * Set atomic module in cache by full filepath (including .style-this.js extension)
   */
  setAtomicModule(filepath: string, value: CssCachEntry): void {
    this.atomicCache.set(filepath, value);
  }

  /**
   * Delete a CSS cache entry
   */
  deleteCssModule(filepath: string): void {
    this.cssCache.delete(filepath);
  }

  /**
   * Delete an atomic cache entry
   */
  deleteAtomicModule(filepath: string): void {
    this.atomicCache.delete(filepath);
  }

  /**
   * Delete a value cache entry
   */
  deleteValueCacheEntry(filepath: string): void {
    // TS version doesn't maintain value cache, that's Rust-side
  }

  /**
   * Invalidate a module by resolving and removing it from both CSS and atomic caches
   */
  invalidateModule(filepath: string, cssExtension = "css"): void {
    const cssKey = `${filepath}.${cssExtension}`;
    const atomicKey = `${filepath}.style-this.js`;
    
    // Resolve stale promises before deleting to prevent deadlocks
    // If the atomic entrypoint is already awaiting these promises, they need to resolve
    const cssEntry = this.cssCache.get(cssKey);
    if (cssEntry && cssEntry.resolve) {
      cssEntry.resolve('/* invalidated */');
    }
    
    const atomicEntry = this.atomicCache.get(atomicKey);
    if (atomicEntry && atomicEntry.resolve) {
      atomicEntry.resolve('/* invalidated */');
    }
    
    // Delete both CSS and atomic cache entries so they will be regenerated
    this.cssCache.delete(cssKey);
    this.atomicCache.delete(atomicKey);
  }
}
