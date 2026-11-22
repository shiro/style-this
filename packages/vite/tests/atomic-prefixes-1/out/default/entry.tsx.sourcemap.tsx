// {
//   "version": 3,
//   "file": "/packages/vite/tests/atomic-prefixes-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/atomic-prefixes-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, mergeStyles } from \"@style-this/core\";\nimport \"@style-this/core/atomic\";\n\n// duplicate properties and longhands followed by their shorthand: the last declaration wins in\n// atomic mode too\nconst duplicates = css`\n  padding: 16px;\n  color: red;\n  padding-left: 4px;\n  padding: 8px;\n  -webkit-line-clamp: 2;\n`;\n\n// shorthands must be emitted before longhands\nconst shorthands = css`\n  margin: 8px;\n  margin-top: 4px;\n  background: none;\n  background-color: blue;\n  border: 0;\n  border-top: 1px solid red;\n`;\n\n// same declaration => same class as in `shorthands`\nconst sameDeclaration = css`\n  margin: 8px;\n`;\n\nexport const merged = mergeStyles(duplicates, shorthands, sameDeclaration);\n\nexport { duplicates, shorthands, sameDeclaration };\n"
//   ],
//   "names": [],
//   "mappings": "AAKmB;;;;;;;AASA;;;;;;;;AAUK"
// }

import { css, mergeStyles } from "@style-this/core";
import "@style-this/core/atomic";

// duplicate properties and longhands followed by their shorthand: the last declaration wins in
// atomic mode too
const duplicates = css`
  padding: 16px;
  color: red;
  padding-left: 4px;
  padding: 8px;
  -webkit-line-clamp: 2;
`;

// shorthands must be emitted before longhands
const shorthands = css`
  margin: 8px;
  margin-top: 4px;
  background: none;
  background-color: blue;
  border: 0;
  border-top: 1px solid red;
`;

// same declaration => same class as in `shorthands`
const sameDeclaration = css`
  margin: 8px;
`;

export const merged = mergeStyles(duplicates, shorthands, sameDeclaration);

export { duplicates, shorthands, sameDeclaration };
