import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const ATOMIC_ENTRYPOINT_ID = `${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`;

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

const cssImport = `import { css } from "@style-this/core";`;
const styled = (body: string) => `${cssImport}\n\nexport const style = css\`\n  ${body}\n\`;\n`;

const syntaxError = `${cssImport}\n\nexport const style = css\`\n  color: blue;\n\`;\n\ninvalid(...\n`;
// function parameters can't be evaluated at build time
const dynamicVariableAccess = `${cssImport}\n\nexport const style = (color: string) => css\`\n  color: \${color};\n\`;\n`;
// used to panic, which hung the transform
const destructuredTemplate = `${cssImport}\n\nexport const [style] = css\`\n  color: blue;\n\`;\n`;

const createEnvironment = () => {
  const modules = new Map<string, { id: string; url: string; file: string; lastHMRTimestamp: number; importers: Set<unknown> }>();
  return {
    name: "client",
    config: { consumer: "client", server: { hmr: {} } },
    hot: { send: vi.fn() },
    moduleGraph: {
      getModuleById: (id: string) => modules.get(id),
      getModulesByFile: (file: string) => new Set([...modules.values()].filter((mod) => mod.file === file)),
      invalidateModule: vi.fn(),
    },
  };
};

/** Settles the load, or returns "pending" if it doesn't within a second (it used to hang forever). */
const settle = async (load: Promise<unknown>) => {
  const pending = new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), 1000));
  return Promise.race([
    load.then(
      (result) => ({ code: typeof result === "string" ? result : ((result as { code?: string })?.code ?? "") }),
      (error) => ({ error: (error as Error).message }),
    ),
    pending,
  ]);
};

describe.each([false, true])("transform errors (atomic: %s)", (atomic) => {
  let dir: string;
  let plugin: Plugin;
  let environment: ReturnType<typeof createEnvironment>;
  let timestamp = 0;

  const path = (name: string) => join(dir, name);

  const transform = async (name: string) => plugin.transform(await readFile(path(name), "utf-8"), path(name));

  const change = async (name: string, code: string) => {
    await writeFile(path(name), code);
    await (plugin.hotUpdate as Function).call(
      { environment },
      { file: path(name), type: "update", timestamp: ++timestamp, modules: [], read: () => readFile(path(name), "utf-8") },
    );
  };

  /** Loads of the file's virtual modules and, in atomic mode, the atomic entrypoint. */
  const loads = (name: string) => ({
    css: settle(plugin.load(`${VIRTUAL_PREFIX}${path(name)}.css`)),
    atomicProgram: atomic ? settle(plugin.load(`${VIRTUAL_PREFIX}${path(name)}.style-this.js`)) : undefined,
    atomicEntrypoint: atomic ? settle(plugin.load(ATOMIC_ENTRYPOINT_ID)) : undefined,
  });

  const expectError = async (name: string, message: string) => {
    const { css, atomicProgram, atomicEntrypoint } = loads(name);
    if (atomic) {
      // other files' atomic CSS is still served
      expect(await atomicEntrypoint).toEqual({ code: expect.stringContaining("color: red") });
      expect(await atomicProgram).toEqual({ error: expect.stringContaining(message) });
    }
    expect(await css).toEqual({ error: expect.stringContaining(message) });
  };

  const expectCss = async (name: string, declaration: string) => {
    const { css, atomicProgram, atomicEntrypoint } = loads(name);
    if (!atomic) {
      expect(await css).toEqual({ code: expect.stringContaining(declaration) });
      return;
    }
    expect(await atomicProgram).toEqual({ code: expect.stringContaining("export const style") });
    expect(await atomicEntrypoint).toEqual({ code: expect.stringContaining(declaration) });
  };

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "style-this-transform-errors-"));
    await writeFile(path("good.tsx"), styled("color: red;"));
    await writeFile(path("other.tsx"), styled("color: green;"));

    plugin = await setupPlugin({ "@style-this/core": "" }, { atomic, debug: false });
    environment = createEnvironment();
    (plugin.configureServer as Function)({ environments: { client: environment } });

    await transform("good.tsx");
    await transform("other.tsx");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test.each([
    ["syntax errors", syntaxError, "failed to parse program", { line: 8, column: 1 }],
    ["dynamic variable access", dynamicVariableAccess, "tried to access dynamic variable 'color'", { line: 3, column: 41 }],
    ["destructured templates", destructuredTemplate, "'css' templates can't be destructured", { line: 3, column: 14 }],
  ])("%s don't block the virtual modules", async (_, code, message, loc) => {
    await writeFile(path("broken.tsx"), code);
    await expect(transform("broken.tsx")).rejects.toMatchObject({
      message: expect.stringContaining(message),
      loc: { file: path("broken.tsx"), ...loc },
    });
    await expectError("broken.tsx", message);
    await expectCss("good.tsx", "color: red");
  });

  test.each([
    ["syntax errors", syntaxError, "failed to parse program"],
    ["dynamic variable access", dynamicVariableAccess, "tried to access dynamic variable 'color'"],
  ])("files recover from %s while editing", async (_, code, message) => {
    await change("other.tsx", code);
    await expect(transform("other.tsx")).rejects.toMatchObject({ message: expect.stringContaining(message) });
    await expectError("other.tsx", message);

    await change("other.tsx", styled("color: purple;"));
    await transform("other.tsx");
    await expectCss("other.tsx", "color: purple");
  });
});
