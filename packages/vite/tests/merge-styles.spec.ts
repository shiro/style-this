import { describe, expect, test } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setupPlugin } from "./util/testUtil";

const transform = async (atomic: boolean, source: string) => {
  const dir = await mkdtemp(join(tmpdir(), "style-this-merge-"));
  try {
    const file = join(dir, "entry.tsx");
    await writeFile(file, source);
    const plugin = await setupPlugin({ "@style-this/core": "" }, { atomic, debug: false });
    const result = await plugin.transform(source, file);
    return result?.code;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

describe("mergeStyles transform", () => {
  const onlyMergeStyles = `import { mergeStyles } from "@style-this/core";
import { a, b } from "./styles";

export const merged = mergeStyles(a, b);
`;

  test("non-atomic: files only importing mergeStyles get joinStyles", async () => {
    const code = await transform(false, onlyMergeStyles);
    expect(code).toContain(`import { joinStyles as mergeStyles } from "@style-this/core";`);
    expect(code).toContain("mergeStyles(a, b)");
  });

  test("atomic: files only importing mergeStyles are left untouched", async () => {
    expect(await transform(true, onlyMergeStyles)).toBeUndefined();
  });

  test("non-atomic: aliased imports keep their local name", async () => {
    const code = await transform(
      false,
      `import { css, mergeStyles as merge } from "@style-this/core";

const a = css\`
  color: red;
\`;

export const merged = merge(a, "foo");
`,
    );
    expect(code).toContain("joinStyles as merge");
    expect(code).not.toMatch(/mergeStyles as merge/);
  });

  test("other imports from core are untouched", async () => {
    const code = await transform(
      false,
      `import { css, extraClass } from "@style-this/core";

export const a = css\`
  color: red;
  \${extraClass("foo")}
\`;
`,
    );
    expect(code).not.toContain("joinStyles");
  });
});
