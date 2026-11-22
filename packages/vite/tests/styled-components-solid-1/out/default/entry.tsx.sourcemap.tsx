// {
//   "version": 3,
//   "file": "/packages/vite/tests/styled-components-solid-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/styled-components-solid-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { styled } from \"@style-this/solid\";\nimport { css } from \"@style-this/core\";\n\n// must not be shadowed by the generated wrapper's props\nconst props = { gap: 4 };\n\nexport const FancyButton = styled.button<{ a: number }>`\n  background: none;\n  border: 1px solid blue;\n  border-radius: 2px;\n  padding: ${({ a }) => a}px;\n  gap: ${() => props.gap}px;\n`;\n\n// must not be shadowed by the generated wrapper's class variable\nconst ui = {\n  accent: \"red\",\n  Card: styled.div`\n    color: ${() => ui.accent};\n  `,\n};\n\nexport default styled.div`\n  color: ${() => ui.accent};\n`;\n\nconst unrelated = css`\n  background: none;\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAM2B;;;;;;;AAWnB;;;;AAKO;;;AAIG"
// }

import { styled } from "@style-this/solid";
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

// must not be shadowed by the generated wrapper's class variable
const ui = {
  accent: "red",
  Card: styled.div`
    color: ${() => ui.accent};
  `,
};

export default styled.div`
  color: ${() => ui.accent};
`;

const unrelated = css`
  background: none;
`;
