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
  
  if (typeof cssRaw === 'string') {
    cssCode = cssRaw;
  } else if (cssRaw && typeof cssRaw === 'object') {
    cssCode = cssRaw.code || '';
    cssMap = cssRaw.map ? JSON.stringify(cssRaw.map, null, 2) : undefined;
  } else {
    cssCode = String(cssRaw || '');
  }
  
  await expect(cssCode).toMatchFileSnapshot(
    `${testDir}/out/${entry}.${plugin.cssExtension}`,
  );
  
  if (cssMap) {
    await expect(cssMap).toMatchFileSnapshot(
      `${testDir}/out/${entry}.${plugin.cssExtension}.map`,
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
  const ctx = {
    async resolve(id: string) {
      if (resolver[id] == undefined) return undefined;
      return Promise.resolve({
        id: resolver[id],
        external: false,
        resolvedBy: "",
      });
    },
    addWatchFile: vi.fn(),
  } as any;

  const pluginOptions = { debug: true, useRequire: true, ...(options || {}) };
  const plugin = vitePlugin(pluginOptions as any);

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
