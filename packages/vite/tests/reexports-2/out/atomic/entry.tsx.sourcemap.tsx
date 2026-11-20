// {
//   "version": 3,
//   "file": "/packages/vite/tests/reexports-2/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/reexports-2/entry.tsx"
//   ],
//   "sourcesContent": [
//     "const scale = 2;\n\n// imports after other statements\nimport { css } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\nimport { primary, secondary, own, palette, tokens } from \"./b\";\n\nexport const box = css`\n  color: ${primary};\n  background: ${secondary};\n  border-color: ${own};\n  outline-color: ${palette.accent};\n  caret-color: ${palette.secondary};\n  text-decoration-color: ${tokens.base};\n  width: ${scale * 10}px;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAOmB"
// }

const scale = 2;

// imports after other statements
import { css } from "@style-this/core";
import "@style-this/core/atomic";
import { primary, secondary, own, palette, tokens } from "./b";

export const box = css`
  color: ${primary};
  background: ${secondary};
  border-color: ${own};
  outline-color: ${palette.accent};
  caret-color: ${palette.secondary};
  text-decoration-color: ${tokens.base};
  width: ${scale * 10}px;
`;
