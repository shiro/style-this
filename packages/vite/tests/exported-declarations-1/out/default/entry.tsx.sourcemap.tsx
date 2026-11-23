// {
//   "version": 3,
//   "file": "/packages/vite/tests/exported-declarations-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/exported-declarations-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport Palette, { getLink, Theme, weight } from \"./b\";\nimport rounded from \"./c\";\n\nconst color = \"red\";\n\nconst nav = css`\n  .${getLink()}, .${Theme.accent} {\n    font-weight: ${weight};\n  }\n`;\n\nconst page = css`\n  .${Page()} > .${Palette.accent}, .${rounded()} {\n    gap: 4px;\n  }\n`;\n\nexport function Button() {\n  const button = css`\n    color: ${color};\n  `;\n  return button;\n}\n\nexport class Card {\n  card = css`\n    padding: 4px;\n  `;\n\n  render() {\n    return css`\n      margin: 8px;\n    `;\n  }\n}\n\nexport default function Page() {\n  return css`\n    display: flex;\n  `;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAMY;;;;;AAMC;AA0BJ;;;;AAnBQ;;;;AAYN;;;;AALF"
// }

import { css } from "@style-this/core";
import Palette, { getLink, Theme, weight } from "./b";
import rounded from "./c";

const color = "red";

const nav = css`
  .${getLink()}, .${Theme.accent} {
    font-weight: ${weight};
  }
`;

const page = css`
  .${Page()} > .${Palette.accent}, .${rounded()} {
    gap: 4px;
  }
`;

export function Button() {
  const button = css`
    color: ${color};
  `;
  return button;
}

export class Card {
  card = css`
    padding: 4px;
  `;

  render() {
    return css`
      margin: 8px;
    `;
  }
}

export default function Page() {
  return css`
    display: flex;
  `;
}
