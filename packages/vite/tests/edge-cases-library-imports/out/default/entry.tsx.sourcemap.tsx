// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-library-imports/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-library-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n// outside of the project's `node_modules`, like the workspace root's in monorepos\nimport { getNumber } from \"some_lib\";\n\nconst a = css`\n  margin: ${getNumber()};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIU"
// }

import { css } from "@style-this/core";
// outside of the project's `node_modules`, like the workspace root's in monorepos
import { getNumber } from "some_lib";

const a = css`
  margin: ${getNumber()};
`;
