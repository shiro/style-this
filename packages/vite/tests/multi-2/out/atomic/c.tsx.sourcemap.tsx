// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const color = \"pink\";\n\nconst exported = css`\n  background: ${color};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIiB"
// }

import { css } from "@style-this/core";

export const color = "pink";

const exported = css`
  background: ${color};
`;
