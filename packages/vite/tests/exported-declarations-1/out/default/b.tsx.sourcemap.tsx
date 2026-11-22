// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nconst accent = \"blue\",\n  outline = accent;\n\nfunction underline(enabled: boolean) {\n  return enabled ? \"underline\" : decoration;\n}\n\nexport function getLink() {\n  return css`\n    text-decoration: ${underline(false)};\n    border-bottom: ${border};\n  `;\n}\n\nexport class Theme {\n  static accent = css`\n    color: ${accent};\n    outline-color: ${outline};\n  `;\n}\n\n// declared below their uses\nconst decoration = \"none\";\nconst border = `1px solid ${accent}`;\n"
//   ],
//   "names": [],
//   "mappings": "AAUS;;;;;AAOS"
// }

import { css } from "@style-this/core";

const accent = "blue",
  outline = accent;

function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
    border-bottom: ${border};
  `;
}

export class Theme {
  static accent = css`
    color: ${accent};
    outline-color: ${outline};
  `;
}

// declared below their uses
const decoration = "none";
const border = `1px solid ${accent}`;
