import { it, expect } from "vitest";
import styleThisLoader from "../src/index";
import { runLoader } from "./util";

it("maps the transformed code through the input sourcemap", async () => {
  const code = `import { css } from "@style-this/core";\nexport const cls = css\`\n  color: red;\n\`;\n`;
  // a previous loader that prepended a line to `original.tsx`
  const inputSourceMap = {
    version: 3,
    sources: ["/tmp/original.tsx"],
    sourcesContent: [code],
    names: [],
    mappings: ";AAAA;AACA;AACA;AACA",
  };
  const { err, map } = await runLoader(styleThisLoader, `\n${code}`, "/tmp/style-this-sourcemap.tsx", inputSourceMap);

  expect(err).toBeNull();
  expect(map).toMatchObject({ sources: ["/tmp/original.tsx"], sourcesContent: [code] });
});
