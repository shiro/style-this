// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nconst decoration = \"none\";\nconst accent = \"blue\";\n\nfunction underline(enabled: boolean) {\n  return enabled ? \"underline\" : decoration;\n}\n\nexport function getLink() {\n  return css`\n    text-decoration: ${underline(false)};\n  `;\n}\n\nexport class Theme {\n  static accent = css`\n    color: ${accent};\n  `;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAUS;AAMS"
// }

import { css } from "@style-this/core";

const decoration = "none";
const accent = "blue";

function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
  `;
}

export class Theme {
  static accent = css`
    color: ${accent};
  `;
}
