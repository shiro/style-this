// {
//   "version": 3,
//   "file": "/packages/vite/tests/atomic-multiline-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/atomic-multiline-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\n\nexport const grid = css`\n  display: grid;\n  grid-template-columns:\n    minmax(0, 1fr)\n    auto;\n  transition:\n    color 0.2s,\n    background 0.2s;\n  &:hover {\n    color: blue;\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGoB"
// }

import { css } from "@style-this/core";
import "@style-this/core/atomic";

export const grid = css`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;
  transition:
    color 0.2s,
    background 0.2s;
  &:hover {
    color: blue;
  }
`;
