import { beforeEach, vi } from "vitest";
import { afterEach } from "vitest";
import vitePlugin from "../../src/index";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { expect } from "vitest";

export const getResolver = async (testDir: string) => {
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

  const cssRaw = plugin.load(id);
  await expect(cssRaw).toMatchFileSnapshot(
    `${testDir}/out/${entry}.${plugin.cssExtension}`,
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

export const setupPlugin = async (resolver: Record<string, string>) => {
  const ctx = {
    async resolve(id: string) {
      if (!resolver[id]) return undefined;
      return Promise.resolve({
        id: resolver[id],
        external: false,
        resolvedBy: "",
      });
    },
    addWatchFile: vi.fn(),
  } as any;

  const plugin = vitePlugin();

  const config = plugin.config.bind(ctx);
  await config({});

  return {
    cssExtension: "css",
    config,
    transform: plugin.transform.bind(ctx),
    resolveId: plugin.resolveId.bind(ctx),
    load: plugin.load.bind(ctx),
  };
};
