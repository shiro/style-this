// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/basic-2/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/basic-2/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nconst foo = \"red\";\nconst a = css`\n  background: ${foo};\n`;\nconst b = css`\n  background: ${foo};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGU;;;AAGA"
// }

import { css } from "@style-this/core";

const foo = "red";
const a = css`
  background: ${foo};
`;
const b = css`
  background: ${foo};
`;
