// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-xezolq");
a.css = `background: red;`;
const cssSourcemapData = [{className:'a-xezolq',start:51,end:76}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-xezolq {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');


// /packages/vite/tests/basic-2/entry.tsx: {"css", "a", "foo", "b"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-j0523w");
a.css = `background: ${foo};`;
let b = new String("b-w5irkh");
b.css = `background: ${foo};`;
const cssSourcemapData = [{className:'a-j0523w',start:70,end:98},{className:'b-w5irkh',start:110,end:138}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve([
`.a-j0523w {
${a.css}
}`,
`.b-w5irkh {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-2/entry.tsx.css');
