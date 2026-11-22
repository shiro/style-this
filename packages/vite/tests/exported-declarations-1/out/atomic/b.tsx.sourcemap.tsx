// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport function getLink() {\n  return css`\n    text-decoration: ${underline(false)};\n    border-bottom: ${border};\n  `;\n}\n\n// declared below their uses\nfunction underline(enabled: boolean) {\n  return enabled ? \"underline\" : decoration;\n}\n\nconst accent = \"blue\",\n  outline = accent;\n\nexport class Theme {\n  static accent = css`\n    color: ${accent};\n    outline-color: ${outline};\n    text-decoration: ${underline(true)};\n  `;\n}\n\nconst decoration = \"none\";\n// `accent` and `borderStyle` move up with it\nconst border = `1px ${borderStyle} ${accent}`;\nconst borderStyle = \"solid\";\n"
//   ],
//   "names": [],
//   "mappings": "AAGS;AAeS"
// }

import { css } from "@style-this/core";

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
    border-bottom: ${border};
  `;
}

// declared below their uses
function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

const accent = "blue",
  outline = accent;

export class Theme {
  static accent = css`
    color: ${accent};
    outline-color: ${outline};
    text-decoration: ${underline(true)};
  `;
}

const decoration = "none";
// `accent` and `borderStyle` move up with it
const border = `1px ${borderStyle} ${accent}`;
const borderStyle = "solid";
