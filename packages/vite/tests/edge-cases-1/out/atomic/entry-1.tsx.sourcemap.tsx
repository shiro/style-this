// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-1/entry-1.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-1/entry-1.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport { num } from \"./shared\";\n\nconst a = css`\n  margin: ${num}px;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGU"
// }

import { css } from "@style-this/core";
import { num } from "./shared";

const a = css`
  margin: ${num}px;
`;
