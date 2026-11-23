// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css as cx } from \"@style-this/core\";\nimport { styled as s } from \"@style-this/solid\";\n\nexport const Base = cx`\n  color: blue;\n`;\n\nexport const FancyButton = s.button`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGoB;AAIO"
// }

import { css as cx } from "@style-this/core";
import { styled as s } from "@style-this/solid";

export const Base = cx`
  color: blue;
`;

export const FancyButton = s.button`
  background: none;
`;
