// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-1/shared.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-1/shared.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const num = Math.random();\n\nconst shared = css`\n  margin: ${num}px;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIe"
// }

import { css } from "@style-this/core";

export const num = Math.random();

const shared = css`
  margin: ${num}px;
`;
