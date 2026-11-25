// /packages/vite/tests/extra-class-1/entry.tsx: {"a", "b", "c", "css", "extraClass"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-encp6v");
a.css = `background: red;
  `;
let b = new String("b-4tu7c1");
b.css = `color: blue;
  `;
let c = new String("c-9mz4di");
c.css = `.${a} {
    color: green;
  }`;
return [
`.a-encp6v {
${a.css}
}`,
`.b-4tu7c1 {
${b.css}
}`,
`.c-9mz4di {
${c.css}
}`
];
