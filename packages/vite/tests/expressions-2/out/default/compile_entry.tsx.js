// /packages/vite/tests/expressions-2/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-7ohiv8");
a.css = `margin: ${() => 99}px;`;
const cssSourcemapData = [{className:'a-7ohiv8',start:51,end:82}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-2/entry.tsx.css').resolve([
`.a-7ohiv8 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-2/entry.tsx.css');
