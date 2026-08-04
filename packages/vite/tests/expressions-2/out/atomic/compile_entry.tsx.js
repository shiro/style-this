// /packages/vite/tests/expressions-1/entry.tsx: {"css", "doPromise", "Promise", "setTimeout", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-f45qro");
a.css = `background: ${doPromise()};`;
const cssSourcemapData = [{className:'a-f45qro',start:162,end:198}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-1/entry.tsx.css').resolve([
`.a-f45qro {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-1/entry.tsx.css');


// /packages/vite/tests/expressions-2/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-7ohiv8");
a.css = `margin: ${() => 99}px;`;
const cssSourcemapData = [{className:'a-7ohiv8',start:51,end:82}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-2/entry.tsx.css').resolve([
`.a-7ohiv8 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-2/entry.tsx.css');
