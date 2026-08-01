// /packages/vite/tests/extra-class-1/entry.tsx: {"css", "b", "a", "extraClass"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-chuvkp foo bar");
a.css = `background: red;
  `;
let b = new String("b-1iv0ta baz");
b.css = `color: blue;
  `;
__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-1/entry.tsx.css').resolve([
`.a-chuvkp {
${a.css}
}`,
`.b-1iv0ta {
${b.css}
}`
].join('\n'));
