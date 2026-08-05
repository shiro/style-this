import { beforeEach, vi } from "vitest";
import { afterEach } from "vitest";
import vitePlugin from "../../src/index";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { expect } from "vitest";

const MONOREPO_ROOT_DIR = resolve(join(__dirname, "../../../.."));

export const getResolver = async (testDir: string, options?: Record<string, any>) => {
  const resolver = (await readdir(testDir, { withFileTypes: true }))
    .filter((dirent) => dirent.isFile())
    .reduce(
      (acc, file) => {
        const nameWithoutExt = file.name.slice(0, file.name.lastIndexOf("."));
        const absFilepath = join(testDir, file.name);
        return { ...acc, [`./${nameWithoutExt}`]: absFilepath };
      },
      {} as Record<string, string>,
    );
  resolver["@style-this/core"] = "";
  resolver["@style-this/solid"] = "";
  return resolver;
};

const evaluateProgramWithMode = async (
  testDir: string,
  entry: string,
  plugin: Awaited<ReturnType<typeof setupPlugin>>,
  mode: "atomic" | "default",
) => {
  const outDir = `${testDir}/out/${mode}`;
  const entryFilepath = `${testDir}/${entry}`;
  const code = await readFile(entryFilepath, "utf-8");
  let transformResult = await plugin.transform(code, entryFilepath);

  if (transformResult) {
    transformResult.code = transformResult.code.replace(testDir, "");
  }

  await expect(transformResult?.code).toMatchFileSnapshot(
    `${outDir}/${entry}`,
  );

  const id = plugin.resolveId(
    `virtual:style-this:${entryFilepath}.${plugin.cssExtension}`,
  )!;
  expect(id).toBeDefined();

  const cssRaw = await plugin.load(id);
  
  // Handle both string and object responses (with source maps)
  let cssCode: string;
  let cssMap: string | undefined;
  let sourceContent: string | undefined;
  
  if (typeof cssRaw === 'string') {
    cssCode = cssRaw;
  } else if (cssRaw && typeof cssRaw === 'object') {
    cssCode = cssRaw.code || '';
    if (cssRaw.map) {
      cssMap = JSON.stringify(cssRaw.map, null, 2);
      // Extract source content from sourcemap
      try {
        const mapObj = cssRaw.map;
        if (mapObj.sourcesContent && mapObj.sourcesContent.length > 0) {
          sourceContent = mapObj.sourcesContent[0];
        }
      } catch (e) {
        // Continue without source content
      }
    }
  } else {
    cssCode = String(cssRaw || '');
  }
  
  await expect(cssCode).toMatchFileSnapshot(
    `${outDir}/${entry}.${plugin.cssExtension}`,
  );
  
  if (cssMap && sourceContent) {
    // Embed sourcemap as JSON comments at the top of the source file
    const sourceMapLines = cssMap.split('\n').map(line => `// ${line}`);
    const sourceMapComment = sourceMapLines.join('\n');
    const sourceWithSourceMap = `${sourceMapComment}\n\n${sourceContent}`;
    
    // Save as .sourcemap.{ext} file (using entry's extension)
    const sourceMapFilename = `${entry}.sourcemap.${entry.split('.').pop()}`;
    await expect(sourceWithSourceMap).toMatchFileSnapshot(
      `${outDir}/${sourceMapFilename}`,
    );
  }

  // Load atomic CSS (for atomic mode or check if it exists in default mode)
  const atomicCssId = plugin.resolveId(
    `virtual:style-this:${entryFilepath}.atomic.css`,
  );
  if (atomicCssId) {
    const atomicCssRaw = await plugin.load(atomicCssId);
    
    let atomicCssCode: string;
    if (typeof atomicCssRaw === 'string') {
      atomicCssCode = atomicCssRaw;
    } else if (atomicCssRaw && typeof atomicCssRaw === 'object') {
      atomicCssCode = atomicCssRaw.code || '';
    } else {
      atomicCssCode = String(atomicCssRaw || '');
    }
    
    // Always snapshot atomic CSS in atomic mode, or if it has content in default mode
    if (mode === 'atomic' || atomicCssCode) {
      await expect(atomicCssCode).toMatchFileSnapshot(
        `${outDir}/${entry}.atomic.css`,
      );
    }
  }

  const temporaryPrograms = Object.entries(plugin.__getTemporaryPrograms())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `// ${key}\n${value}`)
    .join("\n\n")
    .replaceAll(MONOREPO_ROOT_DIR, "");

  await expect(temporaryPrograms).toMatchFileSnapshot(
    `${outDir}/compile_${entry}.js`,
  );
};

export const evaluateProgram = async (
  testDir: string,
  entry: string,
  plugin: Awaited<ReturnType<typeof setupPlugin>>,
) => {
  const entryFilepath = `${testDir}/${entry}`;
  const code = await readFile(entryFilepath, "utf-8");
  let transformResult = await plugin.transform(code, entryFilepath);

  if (transformResult) {
    transformResult.code = transformResult.code.replace(testDir, "");
  }

  await expect(transformResult?.code).toMatchFileSnapshot(
    `${testDir}/out/${entry}`,
  );

  const id = plugin.resolveId(
    `virtual:style-this:${entryFilepath}.${plugin.cssExtension}`,
  )!;
  expect(id).toBeDefined();

  const cssRaw = await plugin.load(id);
  
  // Handle both string and object responses (with source maps)
  let cssCode: string;
  let cssMap: string | undefined;
  let sourceContent: string | undefined;
  
  if (typeof cssRaw === 'string') {
    cssCode = cssRaw;
  } else if (cssRaw && typeof cssRaw === 'object') {
    cssCode = cssRaw.code || '';
    if (cssRaw.map) {
      cssMap = JSON.stringify(cssRaw.map, null, 2);
      // Extract source content from sourcemap
      try {
        const mapObj = cssRaw.map;
        if (mapObj.sourcesContent && mapObj.sourcesContent.length > 0) {
          sourceContent = mapObj.sourcesContent[0];
        }
      } catch (e) {
        // Continue without source content
      }
    }
  } else {
    cssCode = String(cssRaw || '');
  }
  
  await expect(cssCode).toMatchFileSnapshot(
    `${testDir}/out/${entry}.${plugin.cssExtension}`,
  );
  
  if (cssMap && sourceContent) {
    // Embed sourcemap as JSON comments at the top of the source file
    const sourceMapLines = cssMap.split('\n').map(line => `// ${line}`);
    const sourceMapComment = sourceMapLines.join('\n');
    const sourceWithSourceMap = `${sourceMapComment}\n\n${sourceContent}`;
    
    // Save as .sourcemap.{ext} file (using entry's extension)
    const sourceMapFilename = `${entry}.sourcemap.${entry.split('.').pop()}`;
    await expect(sourceWithSourceMap).toMatchFileSnapshot(
      `${testDir}/out/${sourceMapFilename}`,
    );
  }

  // Try to load atomic CSS if it exists (for atomic mode)
  const atomicCssId = plugin.resolveId(
    `virtual:style-this:${entryFilepath}.atomic.css`,
  );
  if (atomicCssId) {
    const atomicCssRaw = await plugin.load(atomicCssId);
    
    let atomicCssCode: string;
    if (typeof atomicCssRaw === 'string') {
      atomicCssCode = atomicCssRaw;
    } else if (atomicCssRaw && typeof atomicCssRaw === 'object') {
      atomicCssCode = atomicCssRaw.code || '';
    } else {
      atomicCssCode = String(atomicCssRaw || '');
    }
    
    if (atomicCssCode) {
      await expect(atomicCssCode).toMatchFileSnapshot(
        `${testDir}/out/${entry}.atomic.css`,
      );
    }
  }

  const temporaryPrograms = Object.entries(plugin.__getTemporaryPrograms())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `// ${key}\n${value}`)
    .join("\n\n")
    .replaceAll(MONOREPO_ROOT_DIR, "");

  await expect(temporaryPrograms).toMatchFileSnapshot(
    `${testDir}/out/compile_${entry}.js`,
  );
};

export const evaluateProgramBothModes = async (
  testDir: string,
  entry: string,
  resolver: Record<string, string>,
) => {
  // Test with default mode
  resetRandom();
  const defaultPlugin = await setupPlugin(resolver, { atomic: false });
  await evaluateProgramWithMode(testDir, entry, defaultPlugin, "default");

  // Test with atomic mode
  resetRandom();
  const atomicPlugin = await setupPlugin(resolver, { atomic: true });
  await evaluateProgramWithMode(testDir, entry, atomicPlugin, "atomic");
};

export const evaluateProgramBothModesMultiFile = async (
  testDir: string,
  entries: string[],
  resolver: Record<string, string>,
) => {
  // Test with default mode
  resetRandom();
  const defaultPlugin = await setupPlugin(resolver, { atomic: false });
  for (const entry of entries) {
    await evaluateProgramWithMode(testDir, entry, defaultPlugin, "default");
  }

  // Test with atomic mode
  resetRandom();
  const atomicPlugin = await setupPlugin(resolver, { atomic: true });
  for (const entry of entries) {
    await evaluateProgramWithMode(testDir, entry, atomicPlugin, "atomic");
  }
};

const originalRandom = Math.random;

beforeEach(() => {
  resetRandom();
});

afterEach(() => {
  Math.random = originalRandom;
});

export const resetRandom = (() => {
  let idx = 0;
  return () => {
    idx = 0;
    const mock = vi.fn(() => (++idx % 100) * 0.01);
    Math.random = mock;
  };
})();

export const tsx = (raw: TemplateStringsArray) => raw.join("");

export const setupPlugin = async (resolver: Record<string, string>, options?: Record<string, any>) => {
  const pluginOptions = { debug: true, useRequire: true, ...(options || {}) };
  const plugin = vitePlugin(pluginOptions as any);
  
  const ctx = {
    async resolve(id: string) {
      // First try plugin's resolveId for virtual modules
      if (id.startsWith('virtual:style-this:')) {
        const resolved = plugin.resolveId?.call(ctx, id, '');
        if (resolved) {
          return Promise.resolve({
            id: typeof resolved === 'string' ? resolved : resolved.id,
            external: false,
            resolvedBy: "",
          });
        }
      }
      
      // Then try the test resolver
      if (resolver[id] == undefined) return undefined;
      return Promise.resolve({
        id: resolver[id],
        external: false,
        resolvedBy: "",
      });
    },
    addWatchFile: vi.fn(),
  } as any;

  const config = plugin.config.bind(ctx);
  await config({});

  // Call buildStart to initialize atomic mode globals
  if (plugin.buildStart) {
    await plugin.buildStart.call(ctx, {});
  }

  return {
    cssExtension: "css",
    config,
    transform: plugin.transform.bind(ctx),
    resolveId: plugin.resolveId.bind(ctx),
    load: plugin.load.bind(ctx),
    __getTemporaryPrograms: plugin.__getTemporaryPrograms.bind(ctx),
  };
};
