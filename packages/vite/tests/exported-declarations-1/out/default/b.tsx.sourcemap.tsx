// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport function getLink() {\n  return css`\n    text-decoration: ${underline(false)};\n    border-bottom: ${border};\n    ${focus().css}\n  `;\n}\n\n// declared below their uses\nfunction underline(enabled: boolean) {\n  return enabled ? \"underline\" : decoration;\n}\n\n// its CSS moves up with it\nfunction focus() {\n  return css`outline: none;`;\n}\n\nconst accent = \"blue\",\n  outline = accent;\n\nexport class Theme {\n  static accent = css`\n    color: ${accent};\n    outline-color: ${outline};\n    text-decoration: ${underline(true)};\n  `;\n}\n\nconst decoration = \"none\";\n// `accent` and `borderStyle` move up with it\nconst border = `1px ${borderStyle} ${accent}`;\nconst borderStyle = \"solid\";\n// destructured into a temporary when the importer evaluates it, which doesn't change the class\n// names above\nexport const { weight } = { weight: \"bold\" };\n\n// references itself under its local name\nexport default class Palette {\n  static primary = \"teal\";\n  static accent = css`\n    color: ${Palette.primary};\n  `;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAGS;;;;;;AAcA;;;AAOS;;;;;;AAkBA"
// }

import { css } from "@style-this/core";

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
    border-bottom: ${border};
    ${focus().css}
  `;
}

// declared below their uses
function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

// its CSS moves up with it
function focus() {
  return css`outline: none;`;
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
// destructured into a temporary when the importer evaluates it, which doesn't change the class
// names above
export const { weight } = { weight: "bold" };

// references itself under its local name
export default class Palette {
  static primary = "teal";
  static accent = css`
    color: ${Palette.primary};
  `;
}
