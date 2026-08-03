// /packages/vite/tests/extra-class-1/entry.tsx: {"css", "b", "extraClass", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-4tu7c1 foo bar");
a.css = `background: red;
  `;
let b = new String("b-9mz4di baz");
b.css = `color: blue;
  `;
const cssSourcemapData = [{className:'a-4tu7c1',start:63,end:115},{className:'b-9mz4di',start:128,end:172}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-1/entry.tsx.css').resolve([
`.a-4tu7c1 {
${a.css}
}`,
`.b-9mz4di {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/extra-class-1/entry.tsx.css');
