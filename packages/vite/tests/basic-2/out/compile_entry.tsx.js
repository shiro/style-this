// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-q3g9a7");
a.css = `background: red;`;
const cssSourcemapData = [{className:'a-q3g9a7',start:51,end:76}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-q3g9a7 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');


// /packages/vite/tests/basic-2/entry.tsx: {"css", "foo", "b", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
let a = new String("a-ole3wx");
a.css = `background: ${foo};`;
let b = new String("b-r4x6jg");
b.css = `background: ${foo};`;
const cssSourcemapData = [{className:'a-ole3wx',start:70,end:98},{className:'b-r4x6jg',start:110,end:138}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve([
`.a-ole3wx {
${a.css}
}`,
`.b-r4x6jg {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-2/entry.tsx.css');
