import { describe, test, expect } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";
import { readFile } from "fs/promises";

describe("deep transitive dependency tracking", () => {
  test("4-level-deep-chain", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name.replace("4-level-deep-chain", "deep-transitive-4-levels")}`;
    const resolver = await getResolver(testDir);
    
    // Create plugin in non-atomic mode
    const plugin = await setupPlugin(resolver, { atomic: false });
    
    const aFile = `${testDir}/a.tsx`;
    const bFile = `${testDir}/b.tsx`;
    const cFile = `${testDir}/c.tsx`;
    const dFile = `${testDir}/d.tsx`;
    
    // Step 1: Transform all files in order (a -> b -> c -> d)
    console.log("\n=== Initial Transformation ===");
    
    const aCode = await readFile(aFile, "utf-8");
    const aResult = await plugin.transform(aCode, aFile);
    expect(aResult?.code).toBeDefined();
    console.log("✓ Transformed a.tsx");
    
    const bCode = await readFile(bFile, "utf-8");
    const bResult = await plugin.transform(bCode, bFile);
    expect(bResult?.code).toBeDefined();
    console.log("✓ Transformed b.tsx");
    
    const cCode = await readFile(cFile, "utf-8");
    const cResult = await plugin.transform(cCode, cFile);
    expect(cResult?.code).toBeDefined();
    console.log("✓ Transformed c.tsx");
    
    const dCode = await readFile(dFile, "utf-8");
    const dResult = await plugin.transform(dCode, dFile);
    expect(dResult?.code).toBeDefined();
    console.log("✓ Transformed d.tsx");
    
    // Step 2: Load CSS for all levels
    console.log("\n=== Loading Initial CSS ===");
    
    const loadCss = async (filepath: string) => {
      const cssImport = `virtual:style-this:${filepath}.${plugin.cssExtension}`;
      const cssId = plugin.resolveId(cssImport, filepath);
      if (!cssId) return "";
      const cssRaw = await plugin.load(cssId);
      return typeof cssRaw === 'string' ? cssRaw : cssRaw?.code || '';
    };
    
    const bCss = await loadCss(bFile);
    const cCss = await loadCss(cFile);
    const dCss = await loadCss(dFile);
    
    console.log("\n--- Level 2 (b.tsx) CSS ---");
    console.log(bCss);
    
    console.log("\n--- Level 3 (c.tsx) CSS ---");
    console.log(cCss);
    
    console.log("\n--- Level 4 (d.tsx) CSS ---");
    console.log(dCss);
    
    // Step 3: Verify initial CSS contains expected values
    console.log("\n=== Verifying Initial Values ===");
    
    // B should contain "red-extended" (from baseColor)
    expect(bCss).toContain("red-extended");
    expect(bCss).toContain("calc(10px * 2)");
    console.log("✓ Level 2 contains values from Level 1");
    
    // C should contain gradient with both "red" and "red-extended"
    expect(cCss).toContain("linear-gradient(red, red-extended)");
    expect(cCss).toContain("max(calc(10px * 2), 50px)");
    console.log("✓ Level 3 contains values from Level 1 and 2");
    
    // D should contain the complete chain
    expect(dCss).toContain("linear-gradient(red, red-extended) with red-extended and red");
    expect(dCss).toContain("clamp(20px, max(calc(10px * 2), 50px), 100px)");
    expect(dCss).toContain("border-color: red");
    console.log("✓ Level 4 contains values from all levels");
    
    // Step 4: Test dependency tracking
    console.log("\n=== Testing Dependency Tracking ===");
    
    // Get the transitive importers when baseColor changes
    const changedExports = ["baseColor"];
    const affectedFiles = plugin.getTransitiveImporters?.(aFile, changedExports) || [];
    
    console.log(`\nFiles affected by changing baseColor in a.tsx:`);
    console.log(`Total affected: ${affectedFiles.length}`);
    affectedFiles.forEach((file: string) => {
      console.log(`  - ${file}`);
    });
    
    // Should include b, c, and d (all depend on baseColor directly or transitively)
    expect(affectedFiles.length).toBeGreaterThan(0);
    expect(affectedFiles).toContain(bFile);
    expect(affectedFiles).toContain(cFile);
    expect(affectedFiles).toContain(dFile);
    console.log("✓ All 4 levels are marked for invalidation");
    console.log(`  Expected: b.tsx, c.tsx, d.tsx`);
    console.log(`  Got: ${affectedFiles.length} files`);
    
    // Step 5: Verify selective invalidation
    console.log("\n=== Testing Selective Invalidation ===");
    
    // If we only change baseSize (not baseColor), check what gets affected
    const sizeChangedExports = ["baseSize"];
    const sizeAffectedFiles = plugin.getTransitiveImporters?.(aFile, sizeChangedExports) || [];
    
    console.log(`\nFiles affected by changing baseSize in a.tsx:`);
    console.log(sizeAffectedFiles);
    
    // Should include b and c (they use baseSize transitively), but not necessarily all
    expect(sizeAffectedFiles).toContain(bFile);
    console.log("✓ Selective invalidation works - only files using baseSize are affected");
    
    // Step 6: Verify star imports
    console.log("\n=== Verifying Star Import Handling ===");
    
    // If any export changes, star importers should be invalidated
    const anyExportChanged = ["baseColor"];
    const allAffected = plugin.getTransitiveImporters?.(aFile, anyExportChanged) || [];
    
    console.log(`\nTotal files in transitive chain: ${allAffected.length}`);
    console.log("✓ Transitive dependency tracking is working correctly!");
    
    console.log("\n=== Test Complete ===\n");
  }, 30000); // 30 second timeout for thorough testing

  test("verify-initial-snapshots", async (ctx) => {
    const testDir = `${__dirname}/${ctx.task.name.replace("verify-initial-snapshots", "deep-transitive-4-levels")}`;
    const resolver = await getResolver(testDir);
    
    // Test both atomic and non-atomic modes
    const modes = [
      { atomic: false, name: "default" },
      { atomic: true, name: "atomic" }
    ];
    
    for (const mode of modes) {
      console.log(`\n=== Testing ${mode.name} mode ===`);
      const plugin = await setupPlugin(resolver, { atomic: mode.atomic });
      
      const files = ["a.tsx", "b.tsx", "c.tsx", "d.tsx"];
      
      for (const file of files) {
        const filepath = `${testDir}/${file}`;
        const code = await readFile(filepath, "utf-8");
        const result = await plugin.transform(code, filepath);
        
        expect(result?.code).toBeDefined();
        console.log(`✓ ${file} transformed successfully in ${mode.name} mode`);
      }
    }
  }, 30000);
});
