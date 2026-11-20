// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-dollar-names/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-dollar-names/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const $btn = css`\n  color: red;\n`;\n\nexport const $Global = css`\n  color: green;\n`;\n\nexport const wrapper = css`\n  .${$btn} {\n    color: blue;\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAEoB;;;AAIG;;;AAIA"
// }

import { css } from "@style-this/core";

export const $btn = css`
  color: red;
`;

export const $Global = css`
  color: green;
`;

export const wrapper = css`
  .${$btn} {
    color: blue;
  }
`;
