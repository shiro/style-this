// {
//   "version": 3,
//   "file": "/packages/vite/tests/expressions-4/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/expressions-4/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, extraClass, style } from \"@style-this/core\";\n\nconst dark = true;\n\n// nested `css` templates are class names in the outer template\nexport const direct = css`\n  .${css`color: green;`}:hover & {\n    color: red;\n  }\n`;\n\nexport const conditional = css`\n  .${dark ? css`color: black;` : css`color: white;`} & {\n    color: blue;\n  }\n`;\n\nexport const arrow = css`\n  .${(() => css`color: pink;`)()} & {\n    color: gray;\n  }\n`;\n\nexport const multiLevel = css`\n  .${css`.${css`color: orange; ${extraClass(\"extra\")}`} & { color: purple; }`} & {\n    color: yellow;\n  }\n`;\n\nconst hover = style`\n  .${css`color: teal;`}:hover & {\n    color: navy;\n  }\n`;\n\nexport const mixin = css`\n  ${hover}\n`;\n\n// function locals are renamed in the nested and `style` templates\nfunction local() {\n  const color = \"olive\";\n  const tint = style`background: ${color};`;\n  return css`\n    .${css`color: ${color};`} & {\n      ${tint}\n    }\n  `;\n}\n\nexport const fromFunction = local();\n\nfunction withDefault(\n  className = css`\n    .${css`color: lime;`} & {\n      color: maroon;\n    }\n  `,\n) {\n  return className;\n}\n\nexport const fromDefault = withDefault();\n"
//   ],
//   "names": [],
//   "mappings": "AAKsB;;;;;AACjB;;;AAKsB;;;;;AACM;;;AAArB;;;AAKS;;;;;AACT;;;AAKc;;;;;AACrB;;;AAAO;;;AAMP;;;AAKgB;;;;;AAQZ;;;;;;AACF;;;AASO;;;;;;AACP"
// }

import { css, extraClass, style } from "@style-this/core";

const dark = true;

// nested `css` templates are class names in the outer template
export const direct = css`
  .${css`color: green;`}:hover & {
    color: red;
  }
`;

export const conditional = css`
  .${dark ? css`color: black;` : css`color: white;`} & {
    color: blue;
  }
`;

export const arrow = css`
  .${(() => css`color: pink;`)()} & {
    color: gray;
  }
`;

export const multiLevel = css`
  .${css`.${css`color: orange; ${extraClass("extra")}`} & { color: purple; }`} & {
    color: yellow;
  }
`;

const hover = style`
  .${css`color: teal;`}:hover & {
    color: navy;
  }
`;

export const mixin = css`
  ${hover}
`;

// function locals are renamed in the nested and `style` templates
function local() {
  const color = "olive";
  const tint = style`background: ${color};`;
  return css`
    .${css`color: ${color};`} & {
      ${tint}
    }
  `;
}

export const fromFunction = local();

function withDefault(
  className = css`
    .${css`color: lime;`} & {
      color: maroon;
    }
  `,
) {
  return className;
}

export const fromDefault = withDefault();
