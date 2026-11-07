import { describe, test, expect, vi } from "vitest";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const ATOMIC_ENTRYPOINT_ID = `${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`;

type FakeModule = { id: string; file: string; importers: Set<FakeModule> };

const createEnvironment = (name: string, consumer: "client" | "server") => {
  const modules = new Map<string, FakeModule>();
  return {
    name,
    config: { consumer },
    reloadModule: vi.fn(),
    moduleGraph: {
      getModuleById: (id: string) => modules.get(id),
      getModulesByFile: (file: string) =>
        new Set([...modules.values()].filter((mod) => mod.file === file)),
      invalidateModule: vi.fn(),
    },
    /** Adds a source file with its virtual modules, the way vite would after loading it. */
    addSourceFile(file: string, atomic: boolean) {
      const source: FakeModule = { id: file, file, importers: new Set() };
      modules.set(file, source);
      for (const ext of atomic ? ["css", "style-this.js"] : ["css"]) {
        const id = `${VIRTUAL_PREFIX}${file}.${ext}`;
        modules.set(id, { id, file: id, importers: new Set([source]) });
      }
      return source;
    },
    addModule(id: string) {
      const mod: FakeModule = { id, file: id, importers: new Set() };
      modules.set(id, mod);
      return mod;
    },
  };
};

type Environment = ReturnType<typeof createEnvironment>;

const loadCode = async (plugin: Awaited<ReturnType<typeof setupPlugin>>, id: string) => {
  const result = await plugin.load(id);
  return typeof result === "string" ? result : (result?.code ?? "");
};

const transformFile = async (plugin: Awaited<ReturnType<typeof setupPlugin>>, filepath: string) =>
  plugin.transform(await readFile(filepath, "utf-8"), filepath);

const hotUpdate = (
  plugin: Awaited<ReturnType<typeof setupPlugin>>,
  environment: Environment,
  file: string,
  timestamp: number,
) =>
  (plugin.hotUpdate as Function).call(
    { environment },
    {
      file,
      type: "update",
      timestamp,
      modules: [...environment.moduleGraph.getModulesByFile(file)],
      read: () => readFile(file, "utf-8"),
    },
  ) as Promise<FakeModule[] | undefined>;

describe("HMR", () => {
  test("propagates transitive changes to all environments and the atomic entrypoint", async () => {
    const dir = await mkdtemp(join(tmpdir(), "style-this-hmr-"));
    try {
      const a = join(dir, "a.ts");
      const b = join(dir, "b.tsx");
      const c = join(dir, "c.tsx");

      await writeFile(a, `export const color = "red";\n`);
      // b's own CSS does not use the import, only its export does
      await writeFile(
        b,
        `import { css } from "@style-this/core";
import { color } from "./a";

export const bStyle = css\`
  display: flex;
\`;

export const derivedColor = "dark" + color;
`,
      );
      await writeFile(
        c,
        `import { css } from "@style-this/core";
import { derivedColor } from "./b";

export const cStyle = css\`
  color: \${derivedColor};
\`;
`,
      );

      const plugin = await setupPlugin(
        { "./a": a, "./b": b, "./c": c, "@style-this/core": "" },
        { atomic: true, debug: false },
      );

      const client = createEnvironment("client", "client");
      const ssr = createEnvironment("ssr", "server");
      (plugin.configureServer as Function)({ environments: { client, ssr } });

      // importer first, b's own transform must not drop the `b -> a` import registered by c
      const cAtomicId = `${VIRTUAL_PREFIX}${c}.style-this.js`;
      await transformFile(plugin, c);
      expect(await loadCode(plugin, cAtomicId)).toMatch(/cStyle = "cStyle-\S+ \S+"/);
      await transformFile(plugin, b);
      await loadCode(plugin, `${VIRTUAL_PREFIX}${b}.style-this.js`);

      const initialEntrypoint = await loadCode(plugin, ATOMIC_ENTRYPOINT_ID);
      expect(initialEntrypoint).toContain("color: darkred");

      expect(plugin.getTransitiveImporters(a, []).sort()).toEqual([b, c].sort());

      for (const environment of [client, ssr]) {
        environment.addModule(a);
        environment.addSourceFile(b, true);
        environment.addSourceFile(c, true);
        environment.addModule(ATOMIC_ENTRYPOINT_ID);
      }

      await writeFile(a, `export const color = "blue";\n`);

      for (const environment of [client, ssr]) {
        const ids = (await hotUpdate(plugin, environment, a, 1))!.map((mod) => mod.id);
        expect(ids.sort()).toEqual([a, b, c, `${VIRTUAL_PREFIX}${b}.style-this.js`, cAtomicId].sort());
        // CSS modules are self-accepting, they are only invalidated and reloaded after transform
        expect(environment.moduleGraph.invalidateModule).toHaveBeenCalledWith(
          environment.moduleGraph.getModuleById(`${VIRTUAL_PREFIX}${c}.css`),
        );
      }

      // the entrypoint may be requested before the affected files are re-transformed
      expect(await loadCode(plugin, ATOMIC_ENTRYPOINT_ID)).not.toContain("color: darkblue");
      client.reloadModule.mockClear();

      await transformFile(plugin, c);
      await transformFile(plugin, b);

      expect(client.reloadModule).toHaveBeenCalledWith(
        client.moduleGraph.getModuleById(`${VIRTUAL_PREFIX}${c}.css`),
      );
      expect(ssr.reloadModule).not.toHaveBeenCalled();

      const cAtomic = await loadCode(plugin, cAtomicId);
      const [, atomicClass] = cAtomic.match(/cStyle = "cStyle-\S+ (\S+)"/)!;

      // once the atomic module resolves, the outdated entrypoint gets reloaded everywhere
      const clientEntrypoint = client.moduleGraph.getModuleById(ATOMIC_ENTRYPOINT_ID);
      await vi.waitFor(() => expect(client.reloadModule).toHaveBeenCalledWith(clientEntrypoint));
      expect(ssr.moduleGraph.invalidateModule).toHaveBeenCalledWith(
        ssr.moduleGraph.getModuleById(ATOMIC_ENTRYPOINT_ID),
      );

      expect(await loadCode(plugin, ATOMIC_ENTRYPOINT_ID)).toContain(`.${atomicClass} { color: darkblue }`);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 30000);

  test("unresolvable imports report an error instead of crashing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "style-this-hmr-"));
    try {
      const file = join(dir, "a.tsx");
      await writeFile(
        file,
        `import { css } from "@style-this/core";
import { color } from "./missing";

export const style = css\`
  color: \${color};
\`;
`,
      );

      for (const atomic of [false, true]) {
        const plugin = await setupPlugin({ "@style-this/core": "" }, { atomic, debug: false });
        await transformFile(plugin, file);
        await expect(plugin.load(`${VIRTUAL_PREFIX}${file}.css`)).rejects.toThrow("./missing");
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 30000);

  test("files with the same name don't share cache entries", async () => {
    const dir = await mkdtemp(join(tmpdir(), "style-this-hmr-"));
    try {
      const x = join(dir, "x", "index.tsx");
      const y = join(dir, "y", "index.tsx");
      await mkdir(join(dir, "x"));
      await mkdir(join(dir, "y"));
      const source = (color: string) => `import { css } from "@style-this/core";

export const style = css\`
  color: ${color};
\`;
`;
      await writeFile(x, source("red"));
      await writeFile(y, source("blue"));

      const plugin = await setupPlugin({ "@style-this/core": "" }, { atomic: false, debug: false });

      await transformFile(plugin, x);
      await transformFile(plugin, y);

      expect(await loadCode(plugin, `${VIRTUAL_PREFIX}${x}.css`)).toContain("color: red");
      expect(await loadCode(plugin, `${VIRTUAL_PREFIX}${y}.css`)).toContain("color: blue");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }, 30000);
});
