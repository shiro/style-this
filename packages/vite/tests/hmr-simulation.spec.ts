import { describe, test, expect } from "vitest";
import { getResolver, setupPlugin } from "./util/testUtil";
import { readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { mkdtemp, rm } from "fs/promises";

describe("HMR simulation with file changes", () => {
  test("change-baseColor-and-verify-transitive-refresh", async () => {
    // Create a temporary directory for our test
    const tempDir = await mkdtemp(join(tmpdir(), "style-this-hmr-test-"));
    
    try {
      // Create initial files with baseColor = "red"
      await writeFile(join(tempDir, "a.tsx"), `import { css } from "@style-this/core";

export const baseColor = "red";
`);
      
      await writeFile(join(tempDir, "b.tsx"), `import { css } from "@style-this/core";
import { baseColor } from "./a";

const bStyle = css\`
  background: \${baseColor};
\`;

export { bStyle };
`);
      
      await writeFile(join(tempDir, "c.tsx"), `import { css } from "@style-this/core";
import { bStyle } from "./b";
import { baseColor } from "./a";

const cStyle = css\`
  color: \${baseColor};
\`;

export { cStyle, bStyle };
`);
      
      // Setup resolver
      const resolver: Record<string, string> = {
        "./a": join(tempDir, "a.tsx"),
        "./b": join(tempDir, "b.tsx"),
        "./c": join(tempDir, "c.tsx"),
        "@style-this/core": "",
      };
      
      // Phase 1: Initial transformation with baseColor = "red"
      console.log("\n=== Phase 1: Initial Transformation ===");
      const plugin = await setupPlugin(resolver, { atomic: false });
      
      const aFile = join(tempDir, "a.tsx");
      const bFile = join(tempDir, "b.tsx");
      const cFile = join(tempDir, "c.tsx");
      
      // Transform all files
      let aCode = await readFile(aFile, "utf-8");
      let bCode = await readFile(bFile, "utf-8");
      let cCode = await readFile(cFile, "utf-8");
      
      await plugin.transform(aCode, aFile);
      await plugin.transform(bCode, bFile);
      await plugin.transform(cCode, cFile);
      
      // Load initial CSS
      const loadCss = async (filepath: string) => {
        const cssImport = `virtual:style-this:${filepath}.${plugin.cssExtension}`;
        const cssId = plugin.resolveId(cssImport, filepath);
        if (!cssId) return "";
        const cssRaw = await plugin.load(cssId);
        return typeof cssRaw === 'string' ? cssRaw : cssRaw?.code || '';
      };
      
      const bCss1 = await loadCss(bFile);
      const cCss1 = await loadCss(cFile);
      
      console.log("Initial b.tsx CSS:", bCss1);
      console.log("Initial c.tsx CSS:", cCss1);
      
      expect(bCss1).toContain("background: red");
      expect(cCss1).toContain("color: red");
      console.log("✓ Initial CSS contains 'red'");
      
      // Phase 2: Change baseColor to "blue"
      console.log("\n=== Phase 2: Changing baseColor from 'red' to 'blue' ===");
      
      await writeFile(join(tempDir, "a.tsx"), `import { css } from "@style-this/core";

export const baseColor = "blue";
`);
      
      // Get affected files before re-transformation
      const affectedFiles = plugin.getTransitiveImporters?.(aFile, ["baseColor"]) || [];
      console.log(`Files marked for invalidation: ${affectedFiles.length}`);
      affectedFiles.forEach((file: string) => {
        console.log(`  - ${file.replace(tempDir, "")}`);
      });
      
      expect(affectedFiles).toContain(bFile);
      expect(affectedFiles).toContain(cFile);
      console.log("✓ Both b.tsx and c.tsx are marked for invalidation");
      
      // Phase 3: Re-transform affected files
      console.log("\n=== Phase 3: Re-transforming Affected Files ===");
      
      // Clear caches and re-transform a.tsx
      plugin.clearValueCache?.(aFile);
      plugin.invalidateModule?.(aFile);
      aCode = await readFile(aFile, "utf-8");
      await plugin.transform(aCode, aFile);
      console.log("✓ Re-transformed a.tsx");
      
      // Re-transform b.tsx
      plugin.clearValueCache?.(bFile);
      plugin.invalidateModule?.(bFile);
      bCode = await readFile(bFile, "utf-8");
      await plugin.transform(bCode, bFile);
      console.log("✓ Re-transformed b.tsx");
      
      // Re-transform c.tsx
      plugin.clearValueCache?.(cFile);
      plugin.invalidateModule?.(cFile);
      cCode = await readFile(cFile, "utf-8");
      await plugin.transform(cCode, cFile);
      console.log("✓ Re-transformed c.tsx");
      
      // Phase 4: Verify CSS updated
      console.log("\n=== Phase 4: Verifying CSS Updated ===");
      
      const bCss2 = await loadCss(bFile);
      const cCss2 = await loadCss(cFile);
      
      console.log("Updated b.tsx CSS:", bCss2);
      console.log("Updated c.tsx CSS:", cCss2);
      
      expect(bCss2).toContain("background: blue");
      expect(cCss2).toContain("color: blue");
      expect(bCss2).not.toContain("background: red");
      expect(cCss2).not.toContain("color: red");
      
      console.log("✓ CSS successfully updated to 'blue' in all dependent files!");
      console.log("\n=== HMR Simulation Complete ===\n");
      
    } finally {
      // Cleanup
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 60000); // 60 second timeout
});
