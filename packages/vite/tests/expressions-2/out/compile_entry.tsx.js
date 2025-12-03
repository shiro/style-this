"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-kde34p");
a.css = `margin: ${() => 99}px;`;

__styleThis_aabbbccc.set('/packages/vite/tests/expressions-2/entry.tsx.css', [
`.a-kde34p {
${a.css}
}`
].join('\n'));