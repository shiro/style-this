// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/expressions-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/expressions-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nconst doPromise = async () => {\n  await new Promise((resolve) => setTimeout(resolve, 10));\n  return \"red\";\n};\n\nconst a = css`\n  background: ${doPromise()};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAOU"
// }

import { css } from "@style-this/core";

const doPromise = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return "red";
};

const a = css`
  background: ${doPromise()};
`;
