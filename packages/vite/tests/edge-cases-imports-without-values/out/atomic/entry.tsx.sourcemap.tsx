// {
//   "version": 3,
//   "file": "/packages/vite/tests/edge-cases-imports-without-values/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/edge-cases-imports-without-values/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n// not `import type`, the file has no values to import\nimport Size, { Theme } from \"./types\";\nimport * as types from \"./types\";\n\nconst pick = (theme: Theme) => theme.color;\nconst scale = (size: Size) => size.value * 2;\n\nexport const box = css`\n  color: ${pick({ color: \"red\" })};\n  width: ${scale({ value: 4 })}px;\n  z-index: ${Object.keys(types).length};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAQmB"
// }

import { css } from "@style-this/core";
// not `import type`, the file has no values to import
import Size, { Theme } from "./types";
import * as types from "./types";

const pick = (theme: Theme) => theme.color;
const scale = (size: Size) => size.value * 2;

export const box = css`
  color: ${pick({ color: "red" })};
  width: ${scale({ value: 4 })}px;
  z-index: ${Object.keys(types).length};
`;
