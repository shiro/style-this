// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-react-aliased-imports/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-react-aliased-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled as s } from \"@style-this/react\";\n\n// not ours, must stay untouched\nconst css = (strings: TemplateStringsArray) => strings.join(\"\");\n\nexport const foreign = css`color: red;`;\n\nexport const FancyButton = s.button`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAO2B"
// }

import { styled as s } from "@style-this/react";

// not ours, must stay untouched
const css = (strings: TemplateStringsArray) => strings.join("");

export const foreign = css`color: red;`;

export const FancyButton = s.button`
  background: none;
`;
