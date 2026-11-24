import { beforeEach, vi } from "vitest";
import { afterEach } from "vitest";
import type { OutputOptions } from "rollup";
import type { BundleObject } from "rollup";
import vitePlugin from "../../src/index";
import { readFile, stat } from "fs/promises";
import { dirname, isAbsolute, join, resolve } from "path";
import { expect } from "vitest";
import { test } from "vitest";

export const MONOREPO_ROOT_DIR = resolve(join(__dirname, "../../../.."));

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

// relative imports are resolved from the filesystem, the resolver only maps bare specifiers and overrides
export const getResolver = async (): Promise<Record<string, string>> => ({
  "@style-this/core": "",
  "@style-this/solid": "",
});

// vite's default `resolve.extensions`, tried after the exact path
const resolveExtensions = ["", ".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"];

const resolveFile = async (id: string) => {
  const queryIndex = id.indexOf("?");
  const [filepath, query] = queryIndex === -1 ? [id, ""] : [id.slice(0, queryIndex), id.slice(queryIndex)];
  for (const extension of resolveExtensions) {
    const stats = await stat(filepath + extension).catch(() => undefined);
    if (stats?.isFile()) return filepath + extension + query;
  }
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
    transformResult.code = transformResult.code.replaceAll(testDir, "");
  }

  await expect(transformResult?.code).toMatchFileSnapshot(
    `${outDir}/${entry}`,
  );

  if (mode === 'atomic') {
    await handleAtomicProgram(testDir, entry, plugin, outDir);
  }

  const cssImport = `virtual:style-this:${entryFilepath}.${plugin.cssExtension}`;
  const cssId = plugin.resolveId(cssImport, entryFilepath);
  if (!cssId) throw new Error(`Failed to resolve id for '${cssImport}'`);

  const cssRaw = await plugin.load(cssId);
  if (!cssRaw || typeof cssRaw !== "object") throw new Error(`Expected CSS module object for '${cssImport}'`);
  const { code: cssCode, map } = cssRaw;

  await expect(cssCode).toMatchFileSnapshot(
    `${outDir}/${entry}.${plugin.cssExtension}`,
  );

  // files without any CSS have no source map, every other CSS module must have one
  if (cssCode === "") {
    expect(map, `source map of empty CSS module '${cssImport}'`).toBeUndefined();
  } else {
    expect(map, `source map of '${cssImport}'`).toBeTruthy();
    const sourceContent = map!.sourcesContent?.[0];
    expect(sourceContent, `source map content of '${cssImport}'`).toBeTypeOf("string");

    // Embed sourcemap as JSON comments at the top of the source file
    const sourceMapComment = JSON.stringify(map, null, 2)
      .replaceAll(MONOREPO_ROOT_DIR, "")
      .split('\n')
      .map(line => `// ${line}`)
      .join('\n');

    // Save as .sourcemap.{ext} file (using entry's extension)
    const sourceMapFilename = `${entry}.sourcemap.${entry.split('.').pop()}`;

    await expect(`${sourceMapComment}\n\n${sourceContent}`).toMatchFileSnapshot(
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

export const evaluateProgramBothModes = async (
  testDir: string,
  entry: string,
  resolver: Record<string, string>,
  options?: Record<string, unknown>,
) => {
  // Test with default mode
  resetRandom();
  const defaultPlugin = await setupPlugin(resolver, { ...options, atomic: false });
  await evaluateProgramWithMode(testDir, entry, defaultPlugin, "default");

  // Test with atomic mode
  resetRandom();
  const atomicPlugin = await setupPlugin(resolver, { ...options, atomic: true });
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

/**
 * CSS that applies to a file. In atomic mode that's its module CSS plus only the atomic entrypoint rules of the
 * classes its atomic module (`<file>.style-this.js`) currently references, other files' (and stale) atomic rules
 * are excluded.
 */
export const cssOfFile = async (
  load: (id: string) => Promise<string>,
  file: string,
  options: { atomic: boolean },
) => {
  const prefix = "\0virtual:style-this:";
  const moduleCss = await load(`${prefix}${file}.css`);
  if (!options.atomic) return moduleCss;

  const atomicModule = await load(`${prefix}${file}.style-this.js`);
  const classes = new Set(
    [...atomicModule.matchAll(/=\s*"([^"]*)"/g)].flatMap(([, value]) => value.split(/\s+/).filter(Boolean)),
  );
  const entrypoint = await load(`${prefix}__style_this_atomic_entrypoint.css`);
  const rules = [...entrypoint.matchAll(/^\s*\.([\w-]+)[^{]*\{[^}]*\}/gm)]
    .filter(([, name]) => classes.has(name))
    .map(([rule]) => rule.trim());
  return [moduleCss, ...rules].join("\n");
};

export const setupPlugin = async (
  resolver: Record<string, string | Promise<string>>,
  options?: Record<string, unknown>,
) => {
  // class name hashes depend on paths relative to cwd, pin it so output doesn't depend on where tests run from
  const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(MONOREPO_ROOT_DIR);
  const pluginOptions = { useRequire: true, debug: true, ...(options || {}) };
  const plugin = vitePlugin(pluginOptions as Parameters<typeof vitePlugin>[0]);

  const ctx = {
    async resolve(id: string, importer?: string) {
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

      // like vite, relative imports resolve against the importer, the test resolver can override the resolved
      // path (without extension), resolutions can be delayed by passing a promise
      const key = importer && /^\.\.?\//.test(id) ? resolve(dirname(importer), id) : id;
      const resolved = await (Object.hasOwn(resolver, key)
        ? resolver[key]
        : isAbsolute(key) ? resolveFile(key) : undefined);
      if (resolved == undefined) return undefined;
      return Promise.resolve({
        id: resolved,
        external: false,
        resolvedBy: "",
      });
    },
    addWatchFile: vi.fn(),
  } as unknown as Parameters<typeof plugin.config>[0];

  const config = plugin.config.bind(ctx);
  try {
    await config({});
  } finally {
    cwdSpy.mockRestore();
  }

  return {
    cssExtension: "css",
    config,
    transform: plugin.transform.handler.bind(ctx),
    resolveId: plugin.resolveId.bind(ctx),
    load: plugin.load.bind(ctx),
    __getDebugVirtualModules: plugin.__getDebugVirtualModules.bind(ctx),
    // emitted assets are written into the passed bundle
    generateBundle: (outputOptions: any, bundle: Record<string, any>) =>
      plugin.generateBundle?.call(
        {
          ...ctx,
          emitFile: (file: { fileName: string }) => {
            bundle[file.fileName] = { type: "asset", ...file };
          },
        } as any,
        outputOptions,
        bundle,
      ),
    getTransitiveImporters: plugin.getTransitiveImporters?.bind(plugin),
    hotUpdate: plugin.hotUpdate,
    configureServer: plugin.configureServer,
  };
};
