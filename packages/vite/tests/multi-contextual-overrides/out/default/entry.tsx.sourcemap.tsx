// {
//   "version": 3,
//   "file": "/packages/vite/tests/multi-contextual-overrides/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/multi-contextual-overrides/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport { inner } from \"./b\";\n\nconst outer = css`\n  .${inner} {\n    background: \"red\";\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGc"
// }

import { css } from "@style-this/core";
import { inner } from "./b";

const outer = css`
  .${inner} {
    background: "red";
  }
`;
