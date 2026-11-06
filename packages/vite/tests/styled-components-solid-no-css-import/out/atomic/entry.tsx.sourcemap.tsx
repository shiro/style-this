// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-solid-no-css-import/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-solid-no-css-import/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/solid\";\n\nexport const FancyButton = styled.button`\n  background: none;\n  border: 1px solid blue;\n  &:hover {\n    color: red;\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAE2B"
// }

import { styled } from "@style-this/solid";

export const FancyButton = styled.button`
  background: none;
  border: 1px solid blue;
  &:hover {
    color: red;
  }
`;
