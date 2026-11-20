import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { setupPlugin } from "./util/testUtil";

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const cssImport = `import { css } from "@style-this/core";`;

/** Deadlocks never settle, fail instead of waiting for the test timeout */
const settle = <T,>(promise: Promise<T>, label: string) => {
  let timeout: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`${label} never settled`)), 3000);
    }),
  ]).finally(() => clearTimeout(timeout));
};

/** Two components styling each other */
const mutualStyles = {
  "a.tsx": `${cssImport}
import { bStyle } from "./b";

export const aStyle = css\`
  color: red;
  & .\${bStyle} { color: blue; }
\`;
`,
  "b.tsx": `${cssImport}
import { aStyle } from "./a";

export const bStyle = css\`
  color: green;
  & .\${aStyle} { color: pink; }
\`;
`,
};

const environment = {
  name: "client",
  config: { consumer: "client" },
  moduleGraph: { getModulesByFile: () => new Set(), getModuleById: () => undefined, invalidateModule: vi.fn() },
};

describe.each([false, true])("circular imports (atomic: %s)", (atomic) => {
  let dir: string;
  let plugin: Plugin;

  const path = (name: string) => join(dir, name);

  const setup = async (
    files: Record<string, string>,
    { resolver = {}, debug = false }: { resolver?: Record<string, string | Promise<string>>; debug?: boolean } = {},
  ) => {
    resolver["@style-this/core"] = "";
    for (const [name, code] of Object.entries(files)) {
      await writeFile(path(name), code);
      const id = `./${name.replace(/\.tsx?$/, "")}`;
      if (!Object.hasOwn(resolver, id)) resolver[id] = path(name);
    }
    plugin = await setupPlugin(resolver, { atomic, debug });
    (plugin.configureServer as Function)({ environments: { client: environment } });
  };

  const transform = async (name: string) =>
    settle(plugin.transform(await readFile(path(name), "utf-8"), path(name)), `transform of ${name}`);

  const load = async (id: string) => {
    const result = await settle(Promise.resolve(plugin.load(id)), `loading ${id}`);
    return typeof result === "string" ? result : (result?.code ?? "");
  };

  /** CSS that applies to the file, in atomic mode that includes all atomic CSS. */
  const cssOf = async (name: string) => {
    const moduleCss = await load(`${VIRTUAL_PREFIX}${path(name)}.${plugin.cssExtension}`);
    if (!atomic) return moduleCss;
    await load(`${VIRTUAL_PREFIX}${path(name)}.style-this.js`);
    return moduleCss + (await load(`${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`));
  };

  const circularError = (from: string, to: string) =>
    `circular import of '${path(to)}' from '${path(from)}', its values can't be used before it's evaluated`;

  beforeEach(async () => {
    // quotes and backslashes in paths need to be escaped in the evaluated programs
    dir = await mkdtemp(join(tmpdir(), `style-this-circular-imports-'"\\-`));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("a file importing its own values", async () => {
    await setup({
      "a.tsx": `${cssImport}
import { color as aliased } from "./a";

export const color = "red";
export const aStyle = css\`color: \${aliased};\`;
`,
    });

    await transform("a.tsx");
    await expect(cssOf("a.tsx")).rejects.toThrow(circularError("a.tsx", "a.tsx"));
    // the file isn't left locked
    await transform("a.tsx");
  });

  test("components styling each other", async () => {
    await setup(mutualStyles);

    await transform("a.tsx");
    await expect(cssOf("a.tsx")).rejects.toThrow(circularError("b.tsx", "a.tsx"));
    await transform("b.tsx");
    await expect(cssOf("b.tsx")).rejects.toThrow(circularError("a.tsx", "b.tsx"));
    await transform("a.tsx");
  });

  test("components styling each other, transformed concurrently", async () => {
    await setup(mutualStyles);

    await Promise.all([transform("a.tsx"), transform("b.tsx")]);
    await expect(cssOf("a.tsx")).rejects.toThrow("circular import");
    await expect(cssOf("b.tsx")).rejects.toThrow("circular import");
    // neither file is left locked
    await Promise.all([transform("a.tsx"), transform("b.tsx")]);
  });

  test("cycles through multiple files", async () => {
    await setup({
      "a.tsx": `${cssImport}
import { b } from "./b";

export const a = "red";
export const aStyle = css\`color: \${b};\`;
`,
      "b.ts": `import { c } from "./c";

export const b = c;
`,
      "c.ts": `import { a } from "./a";

export const c = a;
`,
      "d.tsx": `${cssImport}
import { c } from "./c";

export const dStyle = css\`color: \${c};\`;
`,
    });

    await transform("a.tsx");
    await expect(cssOf("a.tsx")).rejects.toThrow(circularError("c.ts", "a.tsx"));

    // entering the cycle elsewhere is a different cycle
    await transform("d.tsx");
    await expect(cssOf("d.tsx")).rejects.toThrow(circularError("b.ts", "c.ts"));
  });

  test("values evaluated before are available in a cycle", async () => {
    await setup({
      "theme.ts": `import { accent } from "./accent";

export const base = "red";
export const highlight = accent;
`,
      "accent.ts": `import { base } from "./theme";

export const accent = base;
`,
      "a.tsx": `${cssImport}
import { base } from "./theme";

export const aStyle = css\`color: \${base};\`;
`,
      "b.tsx": `${cssImport}
import { highlight } from "./theme";

export const bStyle = css\`background: \${highlight};\`;
`,
    });

    await transform("a.tsx");
    expect(await cssOf("a.tsx")).toContain("color: red");
    // `theme.ts` -> `accent.ts` -> `theme.ts`, `base` is already evaluated
    await transform("b.tsx");
    expect(await cssOf("b.tsx")).toContain("background: red");
  });

  test("dependencies evaluated concurrently", async () => {
    await setup({
      "base.ts": `export const base = 4;\n`,
      "theme.ts": `import { base } from "./base";

export const size = \`\${base * 2}px\`;
`,
      "a.tsx": `${cssImport}
import { size } from "./theme";

export const aStyle = css\`width: \${size};\`;
`,
      "b.tsx": `${cssImport}
import { size } from "./theme";

export const bStyle = css\`height: \${size};\`;
`,
    });

    await Promise.all([transform("a.tsx"), transform("b.tsx")]);
    expect(await cssOf("a.tsx")).toContain("width: 8px");
    expect(await cssOf("b.tsx")).toContain("height: 8px");
  });

  test("files changing while they are evaluated are re-evaluated", async () => {
    let resolving!: () => void;
    const resolvingDependency = new Promise<void>((resolve) => (resolving = resolve));
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));

    // `m.ts` waits for its dependency to resolve until released
    const resolver = {};
    Object.defineProperty(resolver, "./n", {
      enumerable: true,
      get: () => {
        resolving();
        return released.then(() => path("n.ts"));
      },
    });

    await setup(
      {
        "n.ts": `export const y = "red";\n`,
        "m.ts": `import { y } from "./n";\n\nexport const x = y;\n`,
        "e.tsx": `${cssImport}
import { x } from "./m";

export const eStyle = css\`color: \${x};\`;
`,
      },
      // debug to observe the evaluations
      { resolver, debug: true },
    );

    await transform("e.tsx");
    await settle(resolvingDependency, "evaluation of m.ts");

    await writeFile(path("m.ts"), `import { y } from "./n";\n\nexport const x = "blue";\n`);
    await (plugin.hotUpdate as Function).call(
      { environment },
      { file: path("m.ts"), type: "update", timestamp: 1, modules: [], read: () => readFile(path("m.ts"), "utf-8") },
    );

    release();
    // the evaluation started before the change finishes with the old values
    await vi.waitFor(() =>
      expect(Object.keys(plugin.__getDebugVirtualModules()).some((key) => key.startsWith(`${path("e.tsx")}:`))).toBe(
        true,
      ),
    );

    await transform("e.tsx");
    expect(await cssOf("e.tsx")).toContain("color: blue");
  });
});
