"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-341afs");
a.css = `background: ${foo};`;
let b = new String("b-unspmr");
b.css = `background: ${foo};`;

__styleThis_aabbbccc.set('/entry.tsx.css', [
`.b-unspmr {
${b.css}
}`,
`.a-341afs {
${a.css}
}`
].join('\n'));