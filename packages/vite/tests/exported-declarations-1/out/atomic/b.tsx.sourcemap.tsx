// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport function getLink() {\n  return css`\n    text-decoration: none;\n  `;\n}\n\nexport class Theme {\n  static accent = css`\n    color: blue;\n  `;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAGS;AAMS"
// }

import { css } from "@style-this/core";

export function getLink() {
  return css`
    text-decoration: none;
  `;
}

export class Theme {
  static accent = css`
    color: blue;
  `;
}
