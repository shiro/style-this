"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-q3g9a7");
a.css = `background: red;`;

__styleThis_aabbbccc.set('/packages/vite/tests/basic-1/entry.tsx.css', [
`.a-q3g9a7 {
${a.css}
}`
].join('\n'));