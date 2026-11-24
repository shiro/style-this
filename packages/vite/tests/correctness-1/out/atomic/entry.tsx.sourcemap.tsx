// {
//   "version": 3,
//   "file": "/packages/vite/tests/correctness-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/correctness-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, style } from \"@style-this/core\";\nimport mib, * as a from \"./a\";\n\n// `var`s belong to the function, also the ones in nested blocks\nfunction spaced() {\n  if (true) {\n    var gap = 2;\n  }\n  return css`padding: ${gap}px;`;\n}\n\nfunction margined() {\n  const margin = () => css`margin: ${gap}px;`;\n  if (true) {\n    var gap = 4;\n  }\n  return margin();\n}\n\n// the CSS in the closure is evaluated where it's called, below `gap`\nfunction gapped() {\n  const margin = () => css`margin: ${gap}px;`;\n  const gap = 3;\n  return css`${margin().css} gap: ${gap}px;`;\n}\n\n// `var`s can be redeclared, also in nested blocks\nfunction redeclared() {\n  var gap = 5;\n  if (true) {\n    var gap = 6;\n  }\n  return css`row-gap: ${gap}px;`;\n}\n\nconst spacedOut = css`\n  ${spaced().css}\n  ${margined().css}\n  ${gapped().css}\n  ${redeclared().css}\n`;\n\n// the locals shadow the parameters, also when declared below their use or inside an expression\nfunction Spacer(size, Unit, error) {\n  function styles() {\n    const double = () => size * 2;\n    const size = 4;\n    const unit = (() => {\n      class Unit {\n        static px = \"px\";\n      }\n      try {\n        throw Unit.px;\n      } catch (error) {\n        return error;\n      }\n    })();\n    return css`margin: ${double()}${unit};`;\n  }\n  return styles();\n}\n\n// the names of function and class expressions are only declared inside them\nfunction Counter(count, Count) {\n  const countdown = function count(n) {\n    return n > 1 ? count(n - 1) : n;\n  };\n  const Doubled = class Count {\n    static size = 2;\n    static double() {\n      return Count.size * 2;\n    }\n  };\n  return css`margin: ${countdown(3)}px ${Doubled.double()}px;`;\n}\n\n// locals shadowing the top level names used below\nconst Button = ({ variant }) => {\n  const color = variant === \"primary\" ? \"blue\" : \"gray\";\n  function mutate() {\n    return variant;\n  }\n  function gap() {\n    return 4;\n  }\n  return [mutate() ?? color, css`gap: ${gap()}px;`];\n};\n\nconst mutate = (v) => v;\n\nconst a1 = () => {\n  const a2 = () => {\n    const a3 = () => {\n      return css`background: black;`;\n    };\n    return a3();\n  };\n  const wi = a2();\n  const m = css`\n    ${wi}\n  `;\n  return wi;\n};\n\nconst b = css`\n  ${a1()}\n`;\n\nconst comp = () => {\n  (\"foob\");\n\n  const b = () => {\n    const c = () => css`\n      background: blue;\n    `;\n\n    const s1 = css`\n      ${c().css}\n    `;\n  };\n\n  mutate(b);\n\n  return css`\n    @media (max-width: 500px) {\n      background: blue;\n    }\n  `;\n};\n\nconst { color } = { color: \"blue\" };\n\nconst st = style`\n  color: ${color};\n  ${mib.foo().css}\n`;\n\nconst s2 = css`\n  ${st}\n  ${comp().css}\n`;\n\n// read themselves, the locals hoisted out of them go below them\nclass Size {\n  static base = 2;\n  static gap() {\n    const gap = Size.base * 2;\n    return css`gap: ${gap}px;`;\n  }\n}\n\nconst spacing = {\n  base: 3,\n  margin() {\n    const margin = spacing.base * 2;\n    return css`margin: ${margin}px;`;\n  },\n};\n\nconst sized = css`\n  ${Size.gap().css}\n  ${spacing.margin().css}\n`;\n\nfunction accent() {\n  return css`color: blue;`;\n}\n\n// the nested `accent` is included on its own and as part of `theme`, both need its CSS, the\n// hoisted one is renamed so it doesn't clash with the top level `accent` and uses `enabled`\nfunction theme() {\n  const enabled = true;\n  function accent() {\n    return enabled ? css`color: red;` : undefined;\n  }\n  const link = css`${accent().css}`;\n  return accent();\n}\n\nconst themed = css`\n  ${theme().css}\n  ${accent().css}\n`;\n\n// parameter defaults are transformed like the rest of the function\nfunction card({ padding = css`padding: 2px;` } = {}) {\n  return padding;\n}\n\nconst carded = css`\n  ${card().css}\n`;\n\nconst unrelated = css`\n  background: none;\n  ${a.foo.css}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAQS;AAIc;AASA;AAEd;AASA;AAGS;AAsBP;AAgBF;AAYoB;AAQhB;AAKD;AAMF;AAQU;AAIL;AAON;;;AAcE;;;AAUA;AAQA;AAIG;AAML;AAQY;AAEN;AAIA;AAMW;AAIX;AAIG"
// }

import { css, style } from "@style-this/core";
import mib, * as a from "./a";

// `var`s belong to the function, also the ones in nested blocks
function spaced() {
  if (true) {
    var gap = 2;
  }
  return css`padding: ${gap}px;`;
}

function margined() {
  const margin = () => css`margin: ${gap}px;`;
  if (true) {
    var gap = 4;
  }
  return margin();
}

// the CSS in the closure is evaluated where it's called, below `gap`
function gapped() {
  const margin = () => css`margin: ${gap}px;`;
  const gap = 3;
  return css`${margin().css} gap: ${gap}px;`;
}

// `var`s can be redeclared, also in nested blocks
function redeclared() {
  var gap = 5;
  if (true) {
    var gap = 6;
  }
  return css`row-gap: ${gap}px;`;
}

const spacedOut = css`
  ${spaced().css}
  ${margined().css}
  ${gapped().css}
  ${redeclared().css}
`;

// the locals shadow the parameters, also when declared below their use or inside an expression
function Spacer(size, Unit, error) {
  function styles() {
    const double = () => size * 2;
    const size = 4;
    const unit = (() => {
      class Unit {
        static px = "px";
      }
      try {
        throw Unit.px;
      } catch (error) {
        return error;
      }
    })();
    return css`margin: ${double()}${unit};`;
  }
  return styles();
}

// the names of function and class expressions are only declared inside them
function Counter(count, Count) {
  const countdown = function count(n) {
    return n > 1 ? count(n - 1) : n;
  };
  const Doubled = class Count {
    static size = 2;
    static double() {
      return Count.size * 2;
    }
  };
  return css`margin: ${countdown(3)}px ${Doubled.double()}px;`;
}

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
