// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-react-aliased-imports/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-react-aliased-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled as s } from \"@style-this/react\";\nimport * as sr from \"@style-this/react\";\n\nexport const NsLink = sr.styled.a`\n  color: blue;\n`;\n\n// shadowed by the parameter, not ours\nexport const shadowed = (s: any) => s.div`color: green;`;\n\n// not ours, must stay untouched\nconst css = (strings: TemplateStringsArray) => strings.join(\"\");\n\nexport const foreign = css`color: red;`;\n\nexport const FancyButton = s.button`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAGsB;;;AAYK"
// }

import { styled as s } from "@style-this/react";
import * as sr from "@style-this/react";

export const NsLink = sr.styled.a`
  color: blue;
`;

// shadowed by the parameter, not ours
export const shadowed = (s: any) => s.div`color: green;`;

// not ours, must stay untouched
const css = (strings: TemplateStringsArray) => strings.join("");

export const foreign = css`color: red;`;

export const FancyButton = s.button`
  background: none;
`;
