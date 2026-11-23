// {
//   "version": 3,
//   "file": "/packages/vite/tests/correctness-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/correctness-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, style } from \"@style-this/core\";\nimport mib, * as a from \"./a\";\n\n// locals shadowing the top level names used below\nconst Button = ({ variant }) => {\n  const color = variant === \"primary\" ? \"blue\" : \"gray\";\n  function mutate() {\n    return variant;\n  }\n  function gap() {\n    return 4;\n  }\n  return [mutate() ?? color, css`gap: ${gap()}px;`];\n};\n\nconst mutate = (v) => v;\n\nconst a1 = () => {\n  const a2 = () => {\n    const a3 = () => {\n      return css`background: black;`;\n    };\n    return a3();\n  };\n  const wi = a2();\n  const m = css`\n    ${wi}\n  `;\n  return wi;\n};\n\nconst b = css`\n  ${a1()}\n`;\n\nconst comp = () => {\n  (\"foob\");\n\n  const b = () => {\n    const c = () => css`\n      background: blue;\n    `;\n\n    const s1 = css`\n      ${c().css}\n    `;\n  };\n\n  mutate(b);\n\n  return css`\n    @media (max-width: 500px) {\n      background: blue;\n    }\n  `;\n};\n\nconst { color } = { color: \"blue\" };\n\nconst st = style`\n  color: ${color};\n  ${mib.foo().css}\n`;\n\nconst s2 = css`\n  ${st}\n  ${comp().css}\n`;\n\n// read themselves, the locals hoisted out of them go below them\nclass Size {\n  static base = 2;\n  static gap() {\n    const gap = Size.base * 2;\n    return css`gap: ${gap}px;`;\n  }\n}\n\nconst spacing = {\n  base: 3,\n  margin() {\n    const margin = spacing.base * 2;\n    return css`margin: ${margin}px;`;\n  },\n};\n\nconst sized = css`\n  ${Size.gap().css}\n  ${spacing.margin().css}\n`;\n\nfunction accent() {\n  return css`color: blue;`;\n}\n\n// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the\n// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`\nfunction theme() {\n  const enabled = true;\n  function accent() {\n    return enabled ? css`color: red;` : undefined;\n  }\n  const link = css`${accent().css}`;\n  return accent();\n}\n\nconst themed = css`\n  ${theme().css}\n  ${accent().css}\n`;\n\n// parameter defaults are transformed like the rest of the function\nfunction card({ padding = css`padding: 2px;` } = {}) {\n  return padding;\n}\n\nconst carded = css`\n  ${card().css}\n`;\n\nconst unrelated = css`\n  background: none;\n  ${a.foo.css}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAY6B;AAQhB;AAKD;AAMF;AAQU;AAIL;AAON;;;AAcE;;;AAUA;AAQA;AAIG;AAML;AAQY;AAEN;AAIA;AAMW;AAIX;AAIG"
// }

import { css, style } from "@style-this/core";
import mib, * as a from "./a";

// locals shadowing the top level names used below
const Button = ({ variant }) => {
  const color = variant === "primary" ? "blue" : "gray";
  function mutate() {
    return variant;
  }
  function gap() {
    return 4;
  }
  return [mutate() ?? color, css`gap: ${gap()}px;`];
};

const mutate = (v) => v;

const a1 = () => {
  const a2 = () => {
    const a3 = () => {
      return css`background: black;`;
    };
    return a3();
  };
  const wi = a2();
  const m = css`
    ${wi}
  `;
  return wi;
};

const b = css`
  ${a1()}
`;

const comp = () => {
  ("foob");

  const b = () => {
    const c = () => css`
      background: blue;
    `;

    const s1 = css`
      ${c().css}
    `;
  };

  mutate(b);

  return css`
    @media (max-width: 500px) {
      background: blue;
    }
  `;
};

const { color } = { color: "blue" };

const st = style`
  color: ${color};
  ${mib.foo().css}
`;

const s2 = css`
  ${st}
  ${comp().css}
`;

// read themselves, the locals hoisted out of them go below them
class Size {
  static base = 2;
  static gap() {
    const gap = Size.base * 2;
    return css`gap: ${gap}px;`;
  }
}

const spacing = {
  base: 3,
  margin() {
    const margin = spacing.base * 2;
    return css`margin: ${margin}px;`;
  },
};

const sized = css`
  ${Size.gap().css}
  ${spacing.margin().css}
`;

function accent() {
  return css`color: blue;`;
}

// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the
// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`
function theme() {
  const enabled = true;
  function accent() {
    return enabled ? css`color: red;` : undefined;
  }
  const link = css`${accent().css}`;
  return accent();
}

const themed = css`
  ${theme().css}
  ${accent().css}
`;

// parameter defaults are transformed like the rest of the function
function card({ padding = css`padding: 2px;` } = {}) {
  return padding;
}

const carded = css`
  ${card().css}
`;

const unrelated = css`
  background: none;
  ${a.foo.css}
`;
