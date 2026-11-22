// {
//   "version": 3,
//   "file": "/packages/vite/tests/reexports-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/reexports-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport getGap, { late, color, renamed, secondary, fromC, border, Props } from \"./b\";\n\nconst pad = (props: Props) => props.gap;\n\nexport const box = css`\n  color: ${color};\n  background: ${renamed};\n  outline-color: ${secondary};\n  border: ${border};\n  border-color: ${fromC};\n  gap: ${getGap()};\n  padding: ${pad({ gap: 2 })}px;\n\n  .${late} {\n    margin: 0;\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAKmB"
// }

import { css } from "@style-this/core";
import getGap, { late, color, renamed, secondary, fromC, border, Props } from "./b";

const pad = (props: Props) => props.gap;

export const box = css`
  color: ${color};
  background: ${renamed};
  outline-color: ${secondary};
  border: ${border};
  border-color: ${fromC};
  gap: ${getGap()};
  padding: ${pad({ gap: 2 })}px;

  .${late} {
    margin: 0;
  }
`;
