import { readFile } from "fs/promises";
import { setupPlugin } from "./testUtil";

/**
 * Result from transforming a single file
 */
export interface TransformResult {
  code?: string;
  map?: any;
  css: string;
  atomicProgram?: string;
}

/**
 * High-level test context that simulates Vite's transform lifecycle.
 * Allows procedural testing of individual files with clear state management.
 * 
 * Example usage:
 * ```ts
 * const ctx = await createTransformContext(resolver, { atomic: false });
 * const result = await ctx.transform(`${testDir}/a.tsx`);
 * expect(result.css).toContain("red");
 * ```
 */
export class TransformContext {
  private plugin: Awaited<ReturnType<typeof setupPlugin>>;
  private resolver: Record<string, string>;
  private transformedFiles = new Set<string>();
  
  constructor(plugin: any, resolver: Record<string, string>) {
    this.plugin = plugin;
    this.resolver = resolver;
  }
  
  /**
   * Transform a single file and return the result
   */
  async transform(filepath: string): Promise<TransformResult> {
    const code = await readFile(filepath, "utf-8");
    const result = await this.plugin.transform(code, filepath);
    this.transformedFiles.add(filepath);
    
    return {
      code: result?.code,
      map: result?.map,
      css: await this.loadCss(filepath),
      atomicProgram: await this.loadAtomicProgram(filepath),
    };
  }
  
  /**
   * Load CSS for a file
   */
  async loadCss(filepath: string): Promise<string> {
    const cssImport = `virtual:style-this:${filepath}.${this.plugin.cssExtension}`;
    const cssId = this.plugin.resolveId(cssImport, filepath); // Pass filepath as importer
    if (!cssId) return "";
    
    const cssRaw = await this.plugin.load(cssId);
    if (typeof cssRaw === 'string') {
      return cssRaw;
    } else if (cssRaw && typeof cssRaw === 'object') {
      return cssRaw.code || '';
    }
    return '';
  }
  
  /**
   * Load atomic program (.style-this.js) for a file
   */
  async loadAtomicProgram(filepath: string): Promise<string | undefined> {
    const atomicImport = `virtual:style-this:${filepath}.style-this.js`;
    const atomicId = this.plugin.resolveId(atomicImport, filepath); // Pass filepath as importer
    if (!atomicId) return undefined;
    
    const atomicRaw = await this.plugin.load(atomicId);
    if (typeof atomicRaw === 'string') {
      return atomicRaw;
    } else if (atomicRaw && typeof atomicRaw === 'object') {
      return atomicRaw.code || '';
    }
    return undefined;
  }
  
  /**
   * Simulate HMR update by re-transforming and getting affected files
   */
  async simulateHotUpdate(filepath: string): Promise<Set<string>> {
    // Get old exports before transformation
    const oldExports = await this.getFileExports(filepath);
    
    // Clear cache and re-transform
    this.plugin.clearValueCache?.(filepath);
    await this.transform(filepath);
    
    // Get new exports
    const newExports = await this.getFileExports(filepath);
    
    // Determine changed exports
    const oldSet = new Set(oldExports);
    const newSet = new Set(newExports);
    const changedExports = [...newSet].filter(exp => !oldSet.has(exp));
    
    // Get transitive importers
    const transitiveImporters = await this.getTransitiveImporters(
      filepath,
      changedExports.length > 0 ? changedExports : [...newSet]
    );
    
    return new Set([filepath, ...transitiveImporters]);
  }
  
  /**
   * Get exports for a file from the value cache
   */
  async getFileExports(filepath: string): Promise<string[]> {
    // This would need to be exposed from the Rust side
    // For now, return empty array as a placeholder
    return [];
  }
  
  /**
   * Get files that transitively depend on changed exports
   */
  async getTransitiveImporters(filepath: string, changedExports: string[]): Promise<string[]> {
    // This would call the Rust method we added
    // For now, return empty array as a placeholder
    return [];
  }
  
  /**
   * Get debug virtual modules
   */
  getDebugModules(): Record<string, string> {
    return this.plugin.__getDebugVirtualModules();
  }
  
  /**
   * Get atomic CSS entrypoint
   */
  async getAtomicCss(): Promise<string> {
    const bundle: any = {};
    if (this.plugin.generateBundle) {
      await this.plugin.generateBundle({}, bundle);
    }
    return bundle["assets/atomic.css"]?.source || "";
  }
  
  /**
   * Get the underlying plugin instance for direct access
   */
  getPlugin() {
    return this.plugin;
  }
}

/**
 * Setup a transform context for testing
 */
export async function createTransformContext(
  resolver: Record<string, string>,
  options?: Record<string, unknown>
): Promise<TransformContext> {
  const plugin = await setupPlugin(resolver, options);
  return new TransformContext(plugin, resolver);
}
