// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-xezolq");
a.css = `background: red;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-xezolq {
${a.css}
}`
].join('\n'));
