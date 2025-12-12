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


// /packages/vite/tests/basic-2/entry.tsx: {"foo", "css", "b", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-ole3wx");
a.css = `background: ${foo};`;
let b = new String("b-r4x6jg");
b.css = `background: ${foo};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve([
`.b-r4x6jg {
${b.css}
}`,
`.a-ole3wx {
${a.css}
}`
].join('\n'));
