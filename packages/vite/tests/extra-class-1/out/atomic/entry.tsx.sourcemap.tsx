// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/extra-class-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/extra-class-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, extraClass } from \"@style-this/core\";\n\nconst a = css`\n  background: red;\n  ${extraClass(\"foo bar\")}\n`;\n\nconst b = css`\n  color: blue;\n  ${extraClass(\"baz\")}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAEU;;;AAKA"
// }

import { css, extraClass } from "@style-this/core";

const a = css`
  background: red;
  ${extraClass("foo bar")}
`;

const b = css`
  color: blue;
  ${extraClass("baz")}
`;
