// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/atomic-prefixes-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/atomic-prefixes-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, mergeStyles } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\n\n// duplicate properties: the last declaration wins in atomic mode too\nconst duplicates = css`\n  padding: 16px;\n  color: red;\n  padding: 8px;\n  -webkit-line-clamp: 2;\n`;\n\n// shorthands must be emitted before longhands\nconst shorthands = css`\n  margin-top: 4px;\n  margin: 8px;\n  background-color: blue;\n  background: none;\n  border-top: 1px solid red;\n  border: 0;\n`;\n\n// same declaration => same class as in `shorthands`\nconst sameDeclaration = css`\n  margin: 8px;\n`;\n\nexport const merged = mergeStyles(duplicates, shorthands, sameDeclaration);\n\nexport { duplicates, shorthands, sameDeclaration };\n"
//   ],
//   "names": [],
//   "mappings": "AAImB;AAQA;AAUK"
// }

import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";

// duplicate properties: the last declaration wins in atomic mode too
const duplicates = css`
  padding: 16px;
  color: red;
  padding: 8px;
  -webkit-line-clamp: 2;
`;

// shorthands must be emitted before longhands
const shorthands = css`
  margin-top: 4px;
  margin: 8px;
  background-color: blue;
  background: none;
  border-top: 1px solid red;
  border: 0;
`;

// same declaration => same class as in `shorthands`
const sameDeclaration = css`
  margin: 8px;
`;

export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);

export { duplicates, shorthands, sameDeclaration };
