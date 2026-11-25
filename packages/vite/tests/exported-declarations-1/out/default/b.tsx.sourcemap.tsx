// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/b.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/b.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport function getLink() {\n  return css`\n    text-decoration: ${underline(false)};\n    border-bottom: ${border};\n    ${focus().css}\n  `;\n}\n\n// declared below their uses\nfunction underline(enabled: boolean) {\n  return enabled ? \"underline\" : decoration;\n}\n\n// its CSS moves up with it\nfunction focus() {\n  return css`outline: none;`;\n}\n\nconst accent = \"blue\",\n  outline = accent;\n\nexport class Theme {\n  static accent = css`\n    color: ${accent};\n    outline-color: ${outline};\n    text-decoration: ${underline(true)};\n  `;\n}\n\nconst decoration = \"none\";\n// `accent` and `borderStyle` move up with it\nconst border = `1px ${borderStyle} ${accent}`;\nconst borderStyle = \"solid\";\n// destructured into a temporary when the importer evaluates it, which doesn't change the class\n// names above\nexport const { weight } = { weight: \"bold\" };\n\n// compiled to JS with the rest\nexport namespace Sizes {\n  export const gap = \"2px\";\n  // members keep their name, even if the outer one is renamed\n  export namespace Inner {\n    export const gap = \"3px\";\n  }\n  // hoisted with the template\n  import Nested = Inner;\n  export const card = css`\n    gap: ${gap};\n    padding: ${Nested.gap};\n  `;\n}\n\nexport enum Weight {\n  Bold = \"bold\",\n}\n\n// merged, each declaration reads it from the value cache\nexport function Badge() {\n  return \"badge\";\n}\nexport namespace Badge {\n  export const color = \"olive\";\n}\n\n// aliases, like `const`\nimport Inner = Sizes.Inner;\nexport import InnerSizes = Sizes.Inner;\nimport type InnerType = Sizes.Inner;\n\nconst grid = css`\n  gap: ${Sizes.gap};\n  padding: ${Inner.gap};\n  font-weight: ${Weight.Bold};\n  color: ${Badge.color};\n`;\n\n// references itself under its local name\nexport default class Palette {\n  static primary = \"teal\";\n  static accent = css`\n    color: ${Palette.primary};\n  `;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAGS;;;;;;AAcA;;;AAOS;;;;;;AAwBI;;;;;AAuBT;;;;;;AAUK"
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

// compiled to JS with the rest
export namespace Sizes {
  export const gap = "2px";
  // members keep their name, even if the outer one is renamed
  export namespace Inner {
    export const gap = "3px";
  }
  // hoisted with the template
  import Nested = Inner;
  export const card = css`
    gap: ${gap};
    padding: ${Nested.gap};
  `;
}

export enum Weight {
  Bold = "bold",
}

// merged, each declaration reads it from the value cache
export function Badge() {
  return "badge";
}
export namespace Badge {
  export const color = "olive";
}

// aliases, like `const`
import Inner = Sizes.Inner;
export import InnerSizes = Sizes.Inner;
import type InnerType = Sizes.Inner;

const grid = css`
  gap: ${Sizes.gap};
  padding: ${Inner.gap};
  font-weight: ${Weight.Bold};
  color: ${Badge.color};
`;

// references itself under its local name
export default class Palette {
  static primary = "teal";
  static accent = css`
    color: ${Palette.primary};
  `;
}
