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

  /**
   * Check if CSS module exists in cache
   */
  hasCssModule(filepath: string): boolean {
    const entry = this.getCssModule(filepath);
    return !!entry;
  }

  /**
   * Check if atomic module exists in cache
   */
  hasAtomicModule(filepath: string): boolean {
    const entry = this.getAtomicModule(filepath);
    return !!entry;
  }

  /**
   * Get CSS module from cache by filepath (including .css extension)
   */
  getCssModule(filepath: string): CssCachEntry | undefined {
    let result = this.cssCache.get(filepath);
    
    // If not found, try basename matching for relative paths
    if (!result) {
      const basename = filepath.split('/').pop() || filepath;
      
      for (const [key, value] of this.cssCache) {
        if (key.endsWith(`/${basename}`) || key === basename) {
          return value;
        }
      }
    }
    
    return result;
  }

  /**
   * Get atomic module from cache by filepath (including .style-this.js extension)
   */
  getAtomicModule(filepath: string): CssCachEntry | undefined {
    let result = this.atomicCache.get(filepath);
    
    // If not found, try basename matching for relative paths
    if (!result) {
      const basename = filepath.split('/').pop() || filepath;
      
      for (const [key, value] of this.atomicCache) {
        if (key.endsWith(`/${basename}`) || key === basename) {
          return value;
        }
      }
    }
    
    return result;
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
   * Invalidate a module by removing it from both CSS and atomic caches
   */
  invalidateModule(filepath: string): void {
    const cssKey = `${filepath}.css`;
    const atomicKey = `${filepath}.style-this.js`;
    
    console.log('[cacheRegistry] Invalidating:', filepath);
    console.log('[cacheRegistry] CSS key:', cssKey, '- exists:', this.cssCache.has(cssKey));
    console.log('[cacheRegistry] Atomic key:', atomicKey, '- exists:', this.atomicCache.has(atomicKey));
    
    // Delete both CSS and atomic cache entries so they will be regenerated
    this.cssCache.delete(cssKey);
    this.atomicCache.delete(atomicKey);
    
    console.log('[cacheRegistry] After delete - CSS exists:', this.cssCache.has(cssKey), 'Atomic exists:', this.atomicCache.has(atomicKey));
  }
}
