// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-react-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-react-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/react\";\nimport { css } from \"@style-this/core\";\n\n// must not be shadowed by the generated wrapper's props\nconst props = { gap: 4 };\n\nexport const FancyButton = styled.button<{ a: number }>`\n  background: none;\n  border: 1px solid blue;\n  border-radius: 2px;\n  padding: ${({ a }) => a}px;\n  gap: ${() => props.gap}px;\n`;\n\nconst unrelated = css`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAM2B;;;;;;;AAQT"
// }

import { styled } from "@style-this/react";
import { css } from "@style-this/core";

// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
  gap: ${() => props.gap}px;
`;

const unrelated = css`
  background: none;
`;
