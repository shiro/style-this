import { describe, expect, test } from "vitest";
import remapping from "@ampproject/remapping";
import { getResolver, setupPlugin } from "./util/testUtil";

const filepath = `${__dirname}/entry.tsx`;

describe.each([false, true])("CSS sourcemap (atomic: %s)", (atomic) => {
  test("rules map to their declarations, not to earlier selectors of their class", async () => {
    const plugin = await setupPlugin(await getResolver(), { debug: false, atomic });
    // the rule of the declaration in the function follows the rule that selects it, non-ASCII text
    // checks that UTF-8 offsets map to UTF-16 positions
    const source = `import { css } from "@style-this/core";
export const header = css\`.\${title()}:hover & { content: "é🎉"; }\`;
function title() { return css\`color: green;\`; }
/* é🎉 */ export const footer = css\`color: red;\`;
`;
    await plugin.transform(source, filepath);
    const { code, map } = (await plugin.load(plugin.resolveId(`virtual:style-this:${filepath}.css`, filepath)!)) as {
      code: string;
      map: Parameters<typeof remapping>[0];
    };

    const cssLines = code.split("\n");
    const sourceLines = source.split("\n");
    const mapped = remapping(map, () => null, { decodedMappings: true }).mappings.flatMap((segments, line) =>
      segments.map(([column, , sourceLine, sourceColumn]) => [
        cssLines[line].slice(column).split("{")[0].trim().replace(/-\w{6}$/, ""),
        sourceLines[sourceLine!].slice(sourceColumn, sourceColumn! + 15),
      ]),
    );

    expect(mapped).toEqual([
      [".header", "css`.${title()}"],
      [".__styleThis_1", "css`color: gree"],
      [".footer", "css`color: red;"],
    ]);
  });
});
