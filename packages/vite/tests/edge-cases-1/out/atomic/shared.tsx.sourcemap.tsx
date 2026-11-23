// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-1/shared.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-1/shared.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const num = Math.random();\n\n// the entries use different names, `top` is cached when evaluating `bottom`\nexport const { top, bottom } = { top: 1, bottom: 2 };\n\nconst shared = css`\n  margin: ${num}px;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAOe"
// }

import { css } from "@style-this/core";

export const num = Math.random();

// the entries use different names, `top` is cached when evaluating `bottom`
export const { top, bottom } = { top: 1, bottom: 2 };

const shared = css`
  margin: ${num}px;
`;
