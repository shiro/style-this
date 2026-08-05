// /packages/vite/tests/extra-class-1/entry.tsx: {"b", "css", "extraClass", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-chuvkp foo bar");
a.css = `background: red;
  `;
let b = new String("b-1iv0ta baz");
b.css = `color: blue;
  `;
const cssSourcemapData = [{className:'a-chuvkp',start:63,end:115},{className:'b-1iv0ta',start:128,end:172}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-1/entry.tsx.css').resolve([
`.a-chuvkp {
${a.css}
}`,
`.b-1iv0ta {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/extra-class-1/entry.tsx.css');
