// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-q3g9a7");
a.css = `background: red;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-q3g9a7 {
${a.css}
}`
].join('\n'));
