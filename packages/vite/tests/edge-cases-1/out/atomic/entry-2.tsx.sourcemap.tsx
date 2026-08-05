// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/entry-2.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/entry-2.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport { num } from \"./shared\";\n\nconst b = css`\n  margin: ${num}px;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGU"
// }

import { css } from "@style-this/core";
import { num } from "./shared";

const b = css`
  margin: ${num}px;
`;
