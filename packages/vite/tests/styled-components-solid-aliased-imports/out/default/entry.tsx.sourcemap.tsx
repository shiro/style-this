// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css as cx } from \"@style-this/core\";\nimport { styled as s } from \"@style-this/solid\";\nimport * as st from \"@style-this/core\";\nimport * as sd from \"@style-this/solid\";\n\nexport const NsBase = st.css`\n  color: red;\n  ${st.extraClass(\"extra\")}\n`;\n\nexport const NsButton = sd.styled.span`\n  margin: 0;\n`;\n\n// shadowed by the parameter, not ours\nexport const shadowed = (cx: any) => cx`color: green;`;\n\nexport const Base = cx`\n  color: blue;\n`;\n\nexport const FancyButton = s.button`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAKsB;;;;AAKE;;;AAOJ;;;AAIO"
// }

import { css as cx } from "@style-this/core";
import { styled as s } from "@style-this/solid";
import * as st from "@style-this/core";
import * as sd from "@style-this/solid";

export const NsBase = st.css`
  color: red;
  ${st.extraClass("extra")}
`;

export const NsButton = sd.styled.span`
  margin: 0;
`;

// shadowed by the parameter, not ours
export const shadowed = (cx: any) => cx`color: green;`;

export const Base = cx`
  color: blue;
`;

export const FancyButton = s.button`
  background: none;
`;
