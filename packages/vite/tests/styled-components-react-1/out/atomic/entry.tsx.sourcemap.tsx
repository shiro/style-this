// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/styled-components-react-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/styled-components-react-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/react\";\nimport { css } from \"@style-this/core\";\n\nexport const FancyButton = styled.button<{ a: number }>`\n  background: none;\n  border: 1px solid blue;\n  border-radius: 2px;\n  padding: ${({ a }) => a}px;\n`;\n\nconst unrelated = css`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAG2B;;;AAOT"
// }

import { styled } from "@style-this/react";
import { css } from "@style-this/core";

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
`;

const unrelated = css`
  background: none;
`;
