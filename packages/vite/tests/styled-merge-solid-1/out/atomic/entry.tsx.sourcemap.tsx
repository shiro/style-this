// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-merge-solid-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-merge-solid-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/solid\";\nimport { css } from \"@style-this/core\";\n\nexport const Base = styled.button`\n  background: none;\n  padding: 8px;\n`;\n\n// overrides Base's padding, Base merges this component's classes last\nexport const Extended = styled(Base)`\n  padding: 16px;\n  color: red;\n`;\n\nexport const override = css`\n  background: blue;\n`;\n\nexport const App = () => <Extended class={override}>hi</Extended>;\n"
//   ],
//   "names": [],
//   "mappings": "AAGoB;AAMI;AAKA"
// }

import { styled } from "@style-this/solid";
import { css } from "@style-this/core";

export const Base = styled.button`
  background: none;
  padding: 8px;
`;

// overrides Base's padding, Base merges this component's classes last
export const Extended = styled(Base)`
  padding: 16px;
  color: red;
`;

export const override = css`
  background: blue;
`;

export const App = () => <Extended class={override}>hi</Extended>;
