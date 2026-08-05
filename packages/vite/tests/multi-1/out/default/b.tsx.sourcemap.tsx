// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport const color = \"red\";\n\nconst exported = css`\n  background: ${color};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIiB"
// }

import { css } from "@style-this/core";

export const color = "red";

const exported = css`
  background: ${color};
`;
