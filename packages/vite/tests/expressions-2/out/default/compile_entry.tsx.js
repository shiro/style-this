// /packages/vite/tests/expressions-2/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-kde34p");
a.css = `margin: ${() => 99}px;`;
const cssSourcemapData = [{className:'a-kde34p',start:51,end:82}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/expressions-2/entry.tsx.css').resolve([
`.a-kde34p {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-2/entry.tsx.css');
