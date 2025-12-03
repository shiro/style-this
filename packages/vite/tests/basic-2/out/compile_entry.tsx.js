"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-ole3wx");
a.css = `background: ${foo};`;
let b = new String("b-r4x6jg");
b.css = `background: ${foo};`;

__styleThis_aabbbccc.set('/packages/vite/tests/basic-2/entry.tsx.css', [
`.b-r4x6jg {
${b.css}
}`,
`.a-ole3wx {
${a.css}
}`
].join('\n'));