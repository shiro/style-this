// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, style } from \"@style-this/core\";\nimport mib, * as a from \"./a\";\n\nconst mutate = (v) => v;\n\nconst a1 = () => {\n  const a2 = () => {\n    const a3 = () => {\n      return css`a`;\n    };\n    return [0];\n  };\n  const wi = a2();\n  const m = css`\n    ${wi}\n  `;\n};\n\nconst b = css`\n  ${a1}\n`;\n\nconst comp = () => {\n  (\"foob\");\n\n  const b = () => {\n    const c = () => css`\n      background: blue;\n    `;\n\n    const s1 = css`\n      ${c().css}\n    `;\n  };\n\n  mutate(b);\n\n  return css``;\n};\n\nconst { color } = { color: \"blue\" };\n\nconst st = style`\n  color: ${color};\n  ${mib.foo().css}\n`;\n\nconst s2 = css`\n  ${st}\n  ${comp().css}\n`;\n\nconst unrelated = css`\n  background: none;\n  ${a.foo.css}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAQa;;;AAKD;;;;AAKF;;;;;;;AAQU;;;;AAIL;;;;;AAON;;;AAUE;;;;;;AAKO"
// }

import { css, style } from "@style-this/core";
import mib, * as a from "./a";

const mutate = (v) => v;

const a1 = () => {
  const a2 = () => {
    const a3 = () => {
      return css`a`;
    };
    return [0];
  };
  const wi = a2();
  const m = css`
    ${wi}
  `;
};

const b = css`
  ${a1}
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

  return css``;
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

const unrelated = css`
  background: none;
  ${a.foo.css}
`;
