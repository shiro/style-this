// {
//   "version": 3,
//   "file": "/packages/vite/tests/extra-class-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/extra-class-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, extraClass } from \"@style-this/core\";\n\nconst a = css`\n  background: red;\n  ${extraClass(\"foo bar\")}\n`;\n\nconst b = css`\n  color: blue;\n  ${extraClass('baz bg-[url(\"x.png\")]')}\n`;\n\nconst c = css`\n  .${a} {\n    color: green;\n  }\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAEU;;;;AAKA;;;;AAKA"
// }

import { css, extraClass } from "@style-this/core";

const a = css`
  background: red;
  ${extraClass("foo bar")}
`;

const b = css`
  color: blue;
  ${extraClass('baz bg-[url("x.png")]')}
`;

const c = css`
  .${a} {
    color: green;
  }
`;
