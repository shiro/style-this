import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { setupPlugin } from "./util/testUtil";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { basename, join } from "path";

const VIRTUAL_PREFIX = "\0virtual:style-this:";
const ATOMIC_ENTRYPOINT_ID = `${VIRTUAL_PREFIX}__style_this_atomic_entrypoint.css`;

type Plugin = Awaited<ReturnType<typeof setupPlugin>>;

const cssImport = `import { css } from "@style-this/core";`;

const files: Record<string, string> = {
  "theme.json": `{ "color": "red", "size": 4, "nested": { "font": "serif" }, "not-an-identifier": "blue", "default": "green" }\n`,
  "default.tsx": `${cssImport}
import theme from "./theme.json";

export const style = css\`
  color: \${theme.color};
  font-family: \${theme.nested.font};
  border-color: \${theme["not-an-identifier"]};
\`;
`,
  "named.tsx": `${cssImport}
import { color, size as gap } from "./theme.json";

export const style = css\`
  color: \${color};
  gap: \${gap}px;
\`;
`,
  "namespace.tsx": `${cssImport}
import * as theme from "./theme.json";

export const style = css\`
  color: \${theme.color};
  gap: \${theme.size}px;
\`;
`,
  "array.json": `["a", "b"]\n`,
  "array.tsx": `${cssImport}
import list from "./array.json";

export const style = css\`
  content: "\${list.join(",")}";
\`;
`,
  "invalid.json": `{ "color": "red", }\n`,
  "invalid.tsx": `${cssImport}
import theme from "./invalid.json";

export const style = css\`
  color: \${theme.color};
\`;
`,
  "icon.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>\n`,
  "svg.tsx": `${cssImport}
import icon from "./icon.svg";

export const style = css\`
  background-image: url(\${icon});
\`;
`,
  "styles.css": `.a { color: red; }\n`,
  "css-import.tsx": `${cssImport}
import "./styles.css";
import styles from "./styles.css";

export const style = css\`
  color: red;
\`;

export const unused = styles;
`,
  "tokens.ts": `export const color = "red";
// "double" 'single' \\backslash \`backtick\` \${notInterpolated}
`,
  "raw.tsx": `${cssImport}
import tokens from "./tokens.ts?raw";

export const style = css\`
  --raw: \${JSON.stringify(tokens)};
\`;
`,
  "raw-and-plain.tsx": `${cssImport}
import tokens from "./tokens.ts?raw";
import { color } from "./tokens.ts";

export const style = css\`
  color: \${color};
  --raw-length: \${tokens.length};
\`;
`,
  "url.tsx": `${cssImport}
import url from "./tokens.ts?url";

export const style = css\`
  background-image: url(\${url});
\`;
`,
  "working.tsx": `${cssImport}

export const style = css\`
  color: purple;
\`;
`,
};

const loadCode = async (plugin: Plugin, id: string) => {
  const result = await plugin.load(id);
  return typeof result === "string" ? result : (result?.code ?? "");
};

describe.each([false, true])("JSON and other non-JS dependencies (atomic: %s)", (atomic) => {
  let dir: string;
  let plugin: Plugin;
  let timestamp = 0;

  const path = (name: string) => join(dir, name);

  const transform = async (name: string) =>
    plugin.transform(await readFile(path(name), "utf-8"), path(name));

  /** CSS that applies to the file, in atomic mode that includes all atomic CSS. */
  const cssOf = async (name: string) => {
    await transform(name);
    const moduleCss = await loadCode(plugin, `${VIRTUAL_PREFIX}${path(name)}.css`);
    if (!atomic) return moduleCss;
    await loadCode(plugin, `${VIRTUAL_PREFIX}${path(name)}.style-this.js`);
    return moduleCss + (await loadCode(plugin, ATOMIC_ENTRYPOINT_ID));
  };

  /** Writes a file and runs the HMR update, returns the affected source files. */
  const change = async (name: string, code: string) => {
    await writeFile(path(name), code);
    const result = (await (plugin.hotUpdate as Function).call(
      {
        environment: {
          moduleGraph: { getModulesByFile: (file: string) => new Set([{ id: file }]), getModuleById: () => undefined },
        },
      },
      { file: path(name), type: "update", timestamp: ++timestamp, modules: [], read: () => readFile(path(name), "utf-8") },
    )) as { id: string }[] | undefined;
    return (result ?? []).map((mod) => basename(mod.id)).sort();
  };

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "style-this-json-"));
    const resolver: Record<string, string> = { "@style-this/core": "" };
    for (const [name, code] of Object.entries(files)) {
      await writeFile(path(name), code);
      resolver[`./${name}`] = path(name);
    }
    resolver["./tokens.ts?raw"] = `${path("tokens.ts")}?raw`;
    resolver["./tokens.ts?url"] = `${path("tokens.ts")}?url`;

    plugin = await setupPlugin(resolver, { atomic, debug: false });
    (plugin.configureServer as Function)({ environments: {} });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  test("default import of a JSON file", async () => {
    const css = await cssOf("default.tsx");
    expect(css).toContain("color: red");
    expect(css).toContain("font-family: serif");
    expect(css).toContain("border-color: blue");
  });

  test("named imports of top level keys of a JSON file", async () => {
    const css = await cssOf("named.tsx");
    expect(css).toContain("color: red");
    expect(css).toContain("gap: 4px");
  });

  test("namespace import of a JSON file", async () => {
    const css = await cssOf("namespace.tsx");
    expect(css).toContain("color: red");
    expect(css).toContain("gap: 4px");
  });

  test("JSON files that aren't objects", async () => {
    expect(await cssOf("array.tsx")).toContain(`content: "a,b"`);
  });

  test("invalid JSON is reported", async () => {
    await expect(cssOf("invalid.tsx")).rejects.toThrow(/failed to parse program/);
    expect(await cssOf("working.tsx")).toContain("color: purple");
  });

  test("unknown extensions are reported instead of panicking", async () => {
    await expect(cssOf("svg.tsx")).rejects.toThrow(/failed to determine program type from extension '.*icon\.svg'/);
    // the compiler keeps working after the failure
    expect(await cssOf("working.tsx")).toContain("color: purple");
  });

  test("side effect and unreferenced imports of unknown extensions are ignored", async () => {
    expect(await cssOf("css-import.tsx")).toContain("color: red");
  });

  test("raw import of a file is its contents", async () => {
    expect(await cssOf("raw.tsx")).toContain(`--raw: ${JSON.stringify(files["tokens.ts"])}`);
  });

  test("raw and plain imports of the same file are separate modules", async () => {
    const css = await cssOf("raw-and-plain.tsx");
    expect(css).toContain("color: red");
    expect(css).toContain(`--raw-length: ${files["tokens.ts"].length}`);
  });

  test("unsupported import queries are reported", async () => {
    await expect(cssOf("url.tsx")).rejects.toThrow(
      /failed to evaluate import '.*tokens\.ts\?url', '\?raw' is the only supported query/,
    );
    expect(await cssOf("working.tsx")).toContain("color: purple");
  });

  test("editing a file invalidates its raw importers", async () => {
    expect(await cssOf("raw.tsx")).toContain("--raw:");
    expect(await cssOf("raw-and-plain.tsx")).toContain("color: red");

    // a comment doesn't change any export of the plain module, but the raw contents
    const commented = `${files["tokens.ts"]}// comment\n`;
    expect(await change("tokens.ts", commented)).toEqual(
      ["raw-and-plain.tsx", "raw.tsx", "tokens.ts", "tokens.ts?raw"],
    );
    expect(await cssOf("raw.tsx")).toContain(`--raw: ${JSON.stringify(commented)}`);
    expect(await cssOf("raw-and-plain.tsx")).toContain(`--raw-length: ${commented.length}`);

    const blue = commented.replace(`"red"`, `"blue"`);
    expect(await change("tokens.ts", blue)).toEqual(
      ["raw-and-plain.tsx", "raw.tsx", "tokens.ts", "tokens.ts?raw"],
    );
    expect(await cssOf("raw.tsx")).toContain(`--raw: ${JSON.stringify(blue)}`);
    expect(await cssOf("raw-and-plain.tsx")).toContain("color: blue");
  });

  test("editing a JSON file invalidates its importers", async () => {
    expect(await cssOf("default.tsx")).toContain("color: red");
    expect(await cssOf("named.tsx")).toContain("gap: 4px");

    expect(await change("theme.json", files["theme.json"].replace(`"red"`, `"blue"`))).toEqual(
      ["default.tsx", "named.tsx", "theme.json"],
    );
    expect(await cssOf("default.tsx")).toContain("color: blue");
    expect(await cssOf("named.tsx")).toContain("color: blue");

    expect(await change("theme.json", files["theme.json"].replace(`"size": 4`, `"size": 8`))).toEqual(
      ["default.tsx", "named.tsx", "theme.json"],
    );
    expect(await cssOf("named.tsx")).toContain("gap: 8px");
  });
});
