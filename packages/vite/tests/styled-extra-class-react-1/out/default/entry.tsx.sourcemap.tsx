// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/styled-extra-class-react-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/react\";\nimport { css, extraClass } from \"@style-this/core\";\n\nexport const FancyButton = styled.button<{ a: number }>`\n  background: none;\n  border: 1px solid blue;\n  border-radius: 2px;\n  padding: ${({ a }) => a}px;\n  ${extraClass(\"custom-button primary\")}\n`;\n\nconst unrelated = css`\n  background: none;\n  ${extraClass(\"test-class\")}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAG2B;;;;;;;AAQT"
// }

import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
  ${extraClass("custom-button primary")}
`;

const unrelated = css`
  background: none;
  ${extraClass("test-class")}
`;
