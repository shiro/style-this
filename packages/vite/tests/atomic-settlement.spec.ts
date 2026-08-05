import { describe, test, expect } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";
import { readFile } from "fs/promises";

describe("atomic settlement", () => {
  test("atomic-settlement-1: basic settlement", async (ctx) => {
    const testDir = `${__dirname}/atomic-settlement-1`;
    const resolver = await getResolver(testDir);
    
    // Setup atomic mode plugin
    const plugin = await setupPlugin(resolver, { atomic: true });
    
    const entryFilepath = `${testDir}/entry.tsx`;
    const code = await readFile(entryFilepath, "utf-8");
    
    // Transform the file (this should track CSS evaluation)
    const transformResult = await plugin.transform(code, entryFilepath);
    
    expect(transformResult).toBeDefined();
    expect(transformResult?.code).toContain("import");
    expect(transformResult?.code).toContain("_styleThisClasses");
    
    // Load the atomic.css virtual module
    // This should wait for settlement and return accumulated CSS
    const atomicCssId = plugin.resolveId(
      `virtual:style-this:${entryFilepath}.atomic.css`,
    );
    expect(atomicCssId).toBeDefined();
    
    const atomicCssRaw = await plugin.load(atomicCssId!);
    const atomicCss = typeof atomicCssRaw === 'string' 
      ? atomicCssRaw 
      : atomicCssRaw?.code || '';
    
    // Verify atomic CSS was generated and has meaningful content
    expect(atomicCss).toBeTruthy();
    expect(atomicCss.length).toBeGreaterThan(0);
    
    // Verify it contains at least some CSS rules (has curly braces and properties)
    expect(atomicCss).toMatch(/\{[^}]+\}/);
    expect(atomicCss).toMatch(/:/); // Has CSS properties
  });
  
  test("atomic-settlement-1: concurrent transforms settle correctly", async (ctx) => {
    const testDir = `${__dirname}/atomic-settlement-1`;
    const resolver = await getResolver(testDir);
    
    // Create two separate plugin instances to simulate concurrent requests
    const plugin1 = await setupPlugin(resolver, { atomic: true });
    const plugin2 = await setupPlugin(resolver, { atomic: true });
    
    const entryFilepath = `${testDir}/entry.tsx`;
    const code = await readFile(entryFilepath, "utf-8");
    
    // Start both transforms concurrently
    const transform1Promise = plugin1.transform(code, entryFilepath);
    const transform2Promise = plugin2.transform(code, entryFilepath);
    
    // Both should complete
    const [result1, result2] = await Promise.all([transform1Promise, transform2Promise]);
    
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    
    // Both should be able to load atomic CSS
    const atomicCssId1 = plugin1.resolveId(`virtual:style-this:${entryFilepath}.atomic.css`);
    const atomicCssId2 = plugin2.resolveId(`virtual:style-this:${entryFilepath}.atomic.css`);
    
    const [atomicCss1Raw, atomicCss2Raw] = await Promise.all([
      plugin1.load(atomicCssId1!),
      plugin2.load(atomicCssId2!)
    ]);
    
    const atomicCss1 = typeof atomicCss1Raw === 'string' ? atomicCss1Raw : atomicCss1Raw?.code || '';
    const atomicCss2 = typeof atomicCss2Raw === 'string' ? atomicCss2Raw : atomicCss2Raw?.code || '';
    
    // Both should have atomic CSS
    expect(atomicCss1.length).toBeGreaterThan(0);
    expect(atomicCss2.length).toBeGreaterThan(0);
  });
  
  test("multi-file settlement", async () => {
    const testDir = `${__dirname}/atomic-settlement-multi`;
    const resolver = await getResolver(testDir);
    
    const plugin = await setupPlugin(resolver, { atomic: true });
    
    const entryFilepath = `${testDir}/entry.tsx`;
    const entryCode = await readFile(entryFilepath, "utf-8");
    
    // Transform entry (which imports shared)
    const entryResult = await plugin.transform(entryCode, entryFilepath);
    expect(entryResult).toBeDefined();
    
    // Load atomic CSS - should contain styles from both entry and shared
    const atomicCssId = plugin.resolveId(`virtual:style-this:${entryFilepath}.atomic.css`);
    const atomicCssRaw = await plugin.load(atomicCssId!);
    const atomicCss = typeof atomicCssRaw === 'string' ? atomicCssRaw : atomicCssRaw?.code || '';
    
    // Should have atomic classes from the transformation
    expect(atomicCss).toBeTruthy();
    expect(atomicCss.length).toBeGreaterThan(0);
    
    // Verify it's valid CSS with class selectors and rules
    expect(atomicCss).toMatch(/\.[a-zA-Z0-9]+\s*\{/); // Has class selectors
    expect(atomicCss).toMatch(/:\s*[^;]+;?/); // Has property-value pairs
  });
});
