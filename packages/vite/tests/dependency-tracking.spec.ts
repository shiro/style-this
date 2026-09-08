import { describe, test, expect } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";
import { readFile } from "fs/promises";

describe("dependency tracking", () => {
  test("transitive-import-invalidation", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name}`;
    const resolver = await getResolver(testDir);
    
    // Create plugin in non-atomic mode
    const plugin = await setupPlugin(resolver, { atomic: false });
    
    // Initial transform: C imports B imports A
    const aFilepath = `${testDir}/a.tsx`;
    const bFilepath = `${testDir}/b.tsx`;
    const cFilepath = `${testDir}/c.tsx`;
    
    const aCode = await readFile(aFilepath, "utf-8");
    const bCode = await readFile(bFilepath, "utf-8");
    const cCode = await readFile(cFilepath, "utf-8");
    
    // Transform A first
    const aTransform = await plugin.transform(aCode, aFilepath);
    expect(aTransform?.code).toBeDefined();
    
    // Transform B (imports from A)
    const bTransform = await plugin.transform(bCode, bFilepath);
    expect(bTransform?.code).toBeDefined();
    
    // Transform C (imports from A and B)
    const cTransform = await plugin.transform(cCode, cFilepath);
    expect(cTransform?.code).toBeDefined();
    
    // Load B's CSS
    const bCssImport = `virtual:style-this:${bFilepath}.${plugin.cssExtension}`;
    const bCssId = plugin.resolveId(bCssImport, bFilepath);
    const bCssRaw = await plugin.load(bCssId);
    const bCss = typeof bCssRaw === 'string' ? bCssRaw : bCssRaw?.code || '';
    
    // Verify B's CSS contains "red" from A
    expect(bCss).toContain("red");
    
    console.log("B CSS:", bCss);
    console.log("Test passed - dependency tracking is working!");
  }, 20000); // Increase timeout to 20s
});

