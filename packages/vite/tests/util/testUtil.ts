import { beforeEach, vi } from "vitest";
import { afterEach } from "vitest";
import type { OutputOptions } from "rollup";
import type { BundleObject } from "rollup";
import vitePlugin from "../../src/index";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { expect } from "vitest";
import { test } from "vitest";

const MONOREPO_ROOT_DIR = resolve(join(__dirname, "../../../.."));

const normalizeTemporaryProgramKeys = (entries: [string, string][]): [string, string][] => {
  return entries.map(([key, value]) => {
    // Normalize the key by sorting variables within the braces
    // Key format: "path: {var1, var2, ...}"
    const match = key.match(/^(.*?):\s*\{([^}]*)\}(.*)$/);
    if (match) {
      const [, path, varsStr, rest] = match;
      const vars = varsStr.split(',').map(v => v.trim()).sort().join(', ');
      const normalizedKey = `${path}: {${vars}}${rest}`;
      return [normalizedKey, value];
    }
    return [key, value];
  });
};

const handleAtomicProgram = async (
  testDir: string,
  entry: string,
  plugin: Awaited<ReturnType<typeof setupPlugin>>,
  outDir: string,
) => {
  const entryPath = `${testDir}/${entry}`;
  let atomicProgramId = plugin.resolveId(`virtual:style-this:${entryPath}.style-this.js`, entryPath);
  if (!atomicProgramId) throw new Error(`Failed to resolve atomic program for entry: ${entry}`);

  const atomicProgram = await plugin.load(atomicProgramId);
  if (typeof atomicProgram !== "object") throw new Error("expected object");

  await expect(atomicProgram.code).toMatchFileSnapshot(`${outDir}/${entry}.compile.style-this.js`);
};

const getAtomicEntrypointCss = async (
  plugin: Awaited<ReturnType<typeof setupPlugin>>,
): Promise<string> => {
  // Call generateBundle to generate the atomic CSS entrypoint
  const bundle: Record<string, BundleObject> = {};
  if (plugin.generateBundle) {
    await plugin.generateBundle({} as OutputOptions, bundle);
  }

  const atomicEntrypointRaw = bundle["assets/atomic.css"].source;
  if (typeof atomicEntrypointRaw !== "string") throw new Error("Failed to get atomic css entrypoint");

  return atomicEntrypointRaw;
};

const snapshotAtomicEntrypoint = async (
  outDir: string,
  atomicCss: string,
) => {
  await expect(atomicCss).toMatchFileSnapshot(
    `${outDir}/atomic.entrypoint.css`,
  );
};

export const getResolver = async (
  testDir: string,
  options?: Record<string, unknown>,
) => {
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

  if (mode === 'atomic') {
    await handleAtomicProgram(testDir, entry, plugin, outDir);
  }

  const cssImport = `virtual:style-this:${entryFilepath}.${plugin.cssExtension}`;
  const cssId = plugin.resolveId(cssImport, entryFilepath);
  expect(cssId, `resolve id for '${cssImport}'`).toBeDefined();

  const cssRaw = await plugin.load(cssId);

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

  const temporaryPrograms = normalizeTemporaryProgramKeys(Object.entries(plugin.__getDebugVirtualModules()))
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
    entryFilepath,
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

  const temporaryPrograms = normalizeTemporaryProgramKeys(Object.entries(plugin.__getDebugVirtualModules()))
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

  // For single-file test, snapshot atomic entrypoint after transformation
  const outDir = `${testDir}/out/atomic`;
  await handleAtomicProgram(testDir, entry, atomicPlugin, outDir);
  const atomicCss = await getAtomicEntrypointCss(atomicPlugin);
  await snapshotAtomicEntrypoint(outDir, atomicCss);
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
  
  // Transform all entries first to accumulate atomic CSS
  for (const entry of entries) {
    await evaluateProgramWithMode(testDir, entry, atomicPlugin, "atomic");
  }

  // After all entries processed, snapshot the atomic program exports and entrypoint CSS
  const outDir = `${testDir}/out/atomic`;
  for (const entry of entries) {
    await handleAtomicProgram(testDir, entry, atomicPlugin, outDir);
  }

  // Only snapshot the final atomic entrypoint CSS once at the end
  const atomicCss = await getAtomicEntrypointCss(atomicPlugin);
  await snapshotAtomicEntrypoint(outDir, atomicCss);
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

export const setupPlugin = async (
  resolver: Record<string, string>,
  options?: Record<string, unknown>,
) => {
  const pluginOptions = { useRequire: true, debug: true, ...(options || {}) };
  const plugin = vitePlugin(pluginOptions as Parameters<typeof vitePlugin>[0]);

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
  } as unknown as Parameters<typeof plugin.config>[0];

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
    __getDebugVirtualModules: plugin.__getDebugVirtualModules.bind(ctx),
    generateBundle: plugin.generateBundle?.bind(ctx),
    getTransitiveImporters: plugin.getTransitiveImporters?.bind(plugin),
    getFileExports: plugin.getFileExports?.bind(plugin),
    clearFileImports: plugin.clearFileImports?.bind(plugin),
    clearValueCache: plugin.clearValueCache?.bind(plugin),
    invalidateModule: plugin.invalidateModule?.bind(plugin),
  };
};
