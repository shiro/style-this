// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const color = \"blue\";\n\nexport const inner = css`\n  background: ${color};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIqB"
// }

import { css } from "@style-this/core";

export const color = "blue";

export const inner = css`
  background: ${color};
`;
