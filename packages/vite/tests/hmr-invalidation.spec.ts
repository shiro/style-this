import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, readFile, rm, writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { basename, join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const ATOMIC_ENTRYPOINT_ID = `${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`;

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

const css = (body: string) => `css\`\n  ${body}\n\``;
const cssImport = `import { css } from "@style-this/core";`;

/** Base project, each component file uses one specific value from `a.ts`/`b.tsx`. */
const files = {
  "a.ts": `// theme
const base = 4;

export const color = "red";
export const size = \`\${base * 2}px\`;
export const unused = "x";
`,
  "b.tsx": `${cssImport}
import { color } from "./a";

export const derived = "dark" + color;
export const fixed = "solid";
export const bStyle = ${css("display: flex;")};
`,
  "c.tsx": `${cssImport}
import { color } from "./a";

export const cStyle = ${css("color: ${color};")};
`,
  "d.tsx": `${cssImport}
import { size } from "./a";

export const dStyle = ${css("width: ${size};")};
`,
  "e.tsx": `${cssImport}
import { derived } from "./b";

export const eStyle = ${css("background: ${derived};")};
`,
  "f.tsx": `${cssImport}
import { fixed } from "./b";

export const fStyle = ${css("border-style: ${fixed};")};
`,
  "g.ts": `export default "1px";
export const other = 1;
`,
  "h.tsx": `${cssImport}
import width from "./g";

export const hStyle = ${css("outline-width: ${width};")};
`,
  "i.tsx": `${cssImport}
import * as theme from "./a";

export const iStyle = ${css("caret-color: ${theme.color};")};
`,
  "palette.ts": `const palette = { primary: "red", secondary: "green" };

export const color = (name: keyof typeof palette) => palette[name];
export const spacing = (n: number) => \`\${n * 4}px\`;
`,
  "j.tsx": `${cssImport}
import { color } from "./palette";

export const jStyle = ${css('color: ${color("primary")};')};
`,
  "k.tsx": `${cssImport}
import { spacing } from "./palette";

export const kStyle = ${css("padding: ${spacing(2)};")};
`,
  "nav.tsx": `import { styled } from "@style-this/solid";
${cssImport}

export const navText = ${css("font-weight: bold;")};

export const NavLink = styled.a\`
  color: red;
\`;

export const NavButton = styled.button\`
  color: blue;
\`;
`,
  "header.tsx": `${cssImport}
import { navText } from "./nav";

export const Header = css\`
  & .\${navText} {
    margin: 1px;
  }
\`;
`,
  "p.ts": `export const width = "1px";\n`,
  "q.ts": `export const style = "solid";\n`,
  "pq.ts": `import { width } from "./p";
import { style } from "./q";

export const border = \`\${width} \${style}\`;
`,
  "w.tsx": `${cssImport}
import { border } from "./pq";

export const wStyle = ${css("border: ${border};")};
`,
};

const entrypoints = [
  "b.tsx", "c.tsx", "d.tsx", "e.tsx", "f.tsx", "h.tsx", "i.tsx", "j.tsx", "k.tsx", "nav.tsx", "header.tsx", "w.tsx",
];

const createEnvironment = (name = "client") => {
  const modules = new Map<string, { id: string; file: string; importers: Set<unknown> }>();
  return {
    name,
    config: { consumer: "client" },
    reloadModule: vi.fn(),
    moduleGraph: {
      getModuleById: (id: string) => modules.get(id),
      getModulesByFile: (file: string) =>
        new Set([...modules.values()].filter((mod) => mod.file === file)),
      invalidateModule: vi.fn(),
    },
    addModule(id: string) {
      modules.set(id, { id, file: id, importers: new Set() });
    },
  };
};

const loadCode = async (plugin: Plugin, id: string) => {
  const result = await plugin.load(id);
  return typeof result === "string" ? result : (result?.code ?? "");
};

describe.each([false, true])("HMR invalidation (atomic: %s)", (atomic) => {
  let dir: string;
  let plugin: Plugin;
  let environment: ReturnType<typeof createEnvironment>;
  let timestamp = 0;

  const path = (name: string) => join(dir, name);

  const transform = async (name: string) =>
    plugin.transform(await readFile(path(name), "utf-8"), path(name));

  /** CSS that applies to the file, in atomic mode that includes all atomic CSS. */
  const cssOf = async (name: string) => {
    const moduleCss = await loadCode(plugin, `${VIRTUAL_PREFIX}${path(name)}.css`);
    if (!atomic) return moduleCss;
    await loadCode(plugin, `${VIRTUAL_PREFIX}${path(name)}.style-this.js`);
    return moduleCss + (await loadCode(plugin, ATOMIC_ENTRYPOINT_ID));
  };

  const hotUpdate = async (
    name: string,
    options: { type?: string; timestamp?: number; env?: typeof environment; read?: () => Promise<string> } = {},
  ) => {
    const env = options.env ?? environment;
    const result = (await (plugin.hotUpdate as Function).call(
      { environment: env },
      {
        file: path(name),
        type: options.type ?? "update",
        timestamp: options.timestamp ?? ++timestamp,
        modules: [...env.moduleGraph.getModulesByFile(path(name))],
        read: options.read ?? (() => readFile(path(name), "utf-8")),
      },
    )) as { id: string }[] | undefined;

    return (result ?? [])
      .map((mod) => mod.id)
      .filter((id) => !id.startsWith(VIRTUAL_PREFIX))
      .map((id) => basename(id))
      .sort();
  };

  /** Writes (or deletes) a file and runs the HMR update, returns the affected source files. */
  const change = async (name: string, code: string | undefined) => {
    if (code === undefined) await unlink(path(name));
    else await writeFile(path(name), code);
    return hotUpdate(name, { type: code === undefined ? "delete" : "update" });
  };

  const edit = async (name: string, replace: (code: string) => string) =>
    change(name, replace(await readFile(path(name), "utf-8")));

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "style-this-hmr-invalidation-"));
    const resolver: Record<string, string> = { "@style-this/core": "", "@style-this/solid": "" };
    for (const [name, code] of Object.entries(files)) {
      await writeFile(path(name), code);
      resolver[`./${name.replace(/\.tsx?$/, "")}`] = path(name);
    }

    plugin = await setupPlugin(resolver, { atomic, debug: false });
    environment = createEnvironment();
    (plugin.configureServer as Function)({ environments: { client: environment } });

    for (const name of Object.keys(files)) environment.addModule(path(name));
    for (const name of entrypoints) {
      await transform(name);
      expect(await cssOf(name)).toBeTruthy();
    }
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("changes that don't affect exported values don't invalidate importers", async () => {
    expect(await edit("a.ts", (code) => code.replace("// theme", "// theme colors"))).toEqual(["a.ts"]);
    expect(await edit("a.ts", (code) => code.replace("const base = 4;", "const   base =\n  4 ;"))).toEqual(["a.ts"]);
    expect(await edit("a.ts", (code) => `${code}\nconst local = 1;\n`)).toEqual(["a.ts"]);
    expect(await edit("a.ts", (code) => `${code}\nexport const added = 1;\n`)).toEqual(["a.ts"]);
    expect(await edit("a.ts", (code) => code.replace(`unused = "x"`, `unused = "y"`))).toEqual(["a.ts"]);
    expect(await edit("b.tsx", (code) => code.replace("display: flex;", "display: grid;"))).toEqual(["b.tsx"]);
    expect(await edit("g.ts", (code) => code.replace("other = 1", "other = 2"))).toEqual(["g.ts"]);
  });

  test("only importers of changed exports are invalidated", async () => {
    // `i.tsx` imports everything from `a.ts`
    expect(await edit("a.ts", (code) => code.replace(`"red"`, `"blue"`))).toEqual(
      ["a.ts", "b.tsx", "c.tsx", "e.tsx", "i.tsx"],
    );
    expect(await edit("a.ts", (code) => code.replace("${base * 2}", "${base * 3}"))).toEqual(
      ["a.ts", "d.tsx", "i.tsx"],
    );
    // local variables exports depend on
    expect(await edit("a.ts", (code) => code.replace("base = 4", "base = 5"))).toEqual(
      ["a.ts", "d.tsx", "i.tsx"],
    );
    expect(await edit("b.tsx", (code) => code.replace(`"solid"`, `"dashed"`))).toEqual(["b.tsx", "f.tsx"]);
    expect(await edit("g.ts", (code) => code.replace(`"1px"`, `"2px"`))).toEqual(["g.ts", "h.tsx"]);
  });

  test("exported functions depend on the local values they use", async () => {
    expect(await edit("palette.ts", (code) => code.replace(`"green"`, `"blue"`))).toEqual(["j.tsx", "palette.ts"]);
    expect(await edit("palette.ts", (code) => code.replace("n * 4", "n * 8"))).toEqual(["k.tsx", "palette.ts"]);
    expect(await edit("palette.ts", (code) => `// colors\n${code}`)).toEqual(["palette.ts"]);

    for (const name of ["j.tsx", "k.tsx"]) await transform(name);
    expect(await cssOf("k.tsx")).toContain("padding: 16px");
  });

  test("styled components only invalidate importers of the changed component", async () => {
    expect(
      await edit("nav.tsx", (code) => code.replace("color: red;", "color: red;\n  background-color: green;")),
    ).toEqual(["nav.tsx"]);
    expect(await edit("nav.tsx", (code) => code.replace("color: blue;", "color: green;"))).toEqual(["nav.tsx"]);
    expect(await edit("nav.tsx", (code) => code.replace("font-weight: bold;", "font-weight: 300;"))).toEqual(
      ["header.tsx", "nav.tsx"],
    );

    await transform("nav.tsx");
    await transform("header.tsx");
    expect(await cssOf("nav.tsx")).toContain("background-color: green");
  });

  test("exports depending on multiple files are invalidated by each of them", async () => {
    expect(await edit("p.ts", (code) => code.replace("1px", "2px"))).toEqual(["p.ts", "pq.ts", "w.tsx"]);
    expect(await edit("q.ts", (code) => code.replace("solid", "dashed"))).toEqual(["pq.ts", "q.ts", "w.tsx"]);

    await transform("w.tsx");
    expect(await cssOf("w.tsx")).toContain("border: 2px dashed");
  });

  test("syntax errors while editing invalidate conservatively", async () => {
    expect(await edit("a.ts", (code) => code.replace(`"red"`, `"red`))).toEqual(
      ["a.ts", "b.tsx", "c.tsx", "d.tsx", "e.tsx", "i.tsx"],
    );
    expect(await edit("a.ts", (code) => code.replace(`"red`, `"blue"`))).toEqual(
      ["a.ts", "b.tsx", "c.tsx", "d.tsx", "e.tsx", "i.tsx"],
    );

    await transform("c.tsx");
    expect(await cssOf("c.tsx")).toContain("color: blue");
  });

  test("unreadable files are invalidated like deleted ones", async () => {
    const read = () => Promise.reject(new Error("ENOENT"));
    expect(await hotUpdate("a.ts", { read })).toEqual(["a.ts", "b.tsx", "c.tsx", "d.tsx", "e.tsx", "i.tsx"]);
  });

  test("every environment gets the affected files of interleaved updates", async () => {
    const ssr = createEnvironment("ssr");
    for (const name of Object.keys(files)) ssr.addModule(path(name));

    await writeFile(path("a.ts"), files["a.ts"].replace(`"red"`, `"blue"`));
    await writeFile(path("q.ts"), files["q.ts"].replace("solid", "dashed"));

    const expected = ["a.ts", "b.tsx", "c.tsx", "e.tsx", "i.tsx"];
    expect(await hotUpdate("a.ts", { timestamp: 100 })).toEqual(expected);
    expect(await hotUpdate("q.ts", { timestamp: 101 })).toEqual(["pq.ts", "q.ts", "w.tsx"]);
    expect(await hotUpdate("a.ts", { timestamp: 100, env: ssr })).toEqual(expected);
    expect(await hotUpdate("q.ts", { timestamp: 101, env: ssr })).toEqual(["pq.ts", "q.ts", "w.tsx"]);
  });

  test("changed imports of exports invalidate their importers", async () => {
    await writeFile(path("a2.ts"), `export const color = "red";\n`);
    expect(
      await edit("b.tsx", (code) => code.replace(`import { color } from "./a";`, `import { color } from "./a2";`)),
    ).toEqual(["b.tsx", "e.tsx"]);
  });

  test("deleting a file invalidates all of its transitive importers", async () => {
    expect(await change("a.ts", undefined)).toEqual(["a.ts", "b.tsx", "c.tsx", "d.tsx", "e.tsx", "i.tsx"]);
  });

  test("CSS is up to date after re-transforming the invalidated files", async () => {
    const invalidated = await edit("a.ts", (code) => code.replace(`"red"`, `"blue"`));
    for (const name of invalidated.filter((name) => entrypoints.includes(name))) await transform(name);

    expect(await cssOf("c.tsx")).toContain("color: blue");
    expect(await cssOf("e.tsx")).toContain("background: darkblue");
    expect(await cssOf("i.tsx")).toContain("caret-color: blue");
    // cached CSS and values that didn't change
    expect(await cssOf("d.tsx")).toContain("width: 8px");
    expect(await cssOf("f.tsx")).toContain("border-style: solid");
    if (!atomic) {
      expect(await cssOf("c.tsx")).not.toContain("red");
      expect(await cssOf("e.tsx")).not.toContain("darkred");
    }

    // re-evaluating a file that depends on unchanged cached values
    await edit("f.tsx", (code) => code.replace("border-style", "border-top-style"));
    await transform("f.tsx");
    expect(await cssOf("f.tsx")).toContain("border-top-style: solid");
  });

  test("unchanged files keep propagating changes of their dependencies", async () => {
    // `b.tsx`'s values aren't re-evaluated, its dependency on `a.ts` must still be known
    expect(await edit("b.tsx", (code) => `// comment\n${code}`)).toEqual(["b.tsx"]);
    await transform("b.tsx");
    expect(await edit("a.ts", (code) => code.replace(`"red"`, `"blue"`))).toEqual(
      ["a.ts", "b.tsx", "c.tsx", "e.tsx", "i.tsx"],
    );

    await transform("b.tsx");
    await transform("e.tsx");
    expect(await cssOf("e.tsx")).toContain("background: darkblue");
  });

  test("consecutive changes before re-evaluation are compared to the evaluated values", async () => {
    expect(await edit("a.ts", (code) => code.replace(`"red"`, `"blue"`))).toContain("c.tsx");
    expect(await edit("a.ts", (code) => code.replace(`"blue"`, `"green"`))).toContain("c.tsx");
    // reverted, but the values evaluated in between could have been `blue`
    expect(await edit("a.ts", (code) => code.replace(`"green"`, `"red"`))).toContain("c.tsx");

    await transform("c.tsx");
    expect(await cssOf("c.tsx")).toContain("color: red");
  });

  test("class names referenced by other files stay in sync", async () => {
    await writeFile(
      path("button.tsx"),
      `${cssImport}

export const Button = ${css("color: red;")};
`,
    );
    await writeFile(
      path("toolbar.tsx"),
      `${cssImport}
import { Button } from "./button";

export const Toolbar = css\`
  & .\${Button} {
    margin: 1px;
  }
\`;
`,
    );
    plugin = await setupPlugin(
      { "@style-this/core": "", "./button": path("button.tsx") },
      { atomic, debug: false },
    );
    (plugin.configureServer as Function)({ environments: { client: environment } });
    environment.addModule(path("button.tsx"));
    environment.addModule(path("toolbar.tsx"));

    const buttonClass = async () => {
      const code = atomic
        ? await loadCode(plugin, `${VIRTUAL_PREFIX}${path("button.tsx")}.style-this.js`)
        : await loadCode(plugin, `${VIRTUAL_PREFIX}${path("button.tsx")}.css`);
      return code.match(/(Button-\w+)/)![1];
    };

    await transform("button.tsx");
    await transform("toolbar.tsx");
    expect(await cssOf("toolbar.tsx")).toContain(`.${await buttonClass()}`);

    // other blocks can change the generated class names
    const invalidated = await edit("button.tsx", (code) =>
      code.replace("export const Button", `export const Link = ${css("color: blue;")};\n\nexport const Button`),
    );
    for (const name of invalidated) await transform(name);
    expect(await cssOf("toolbar.tsx")).toContain(`.${await buttonClass()}`);
  });
});
