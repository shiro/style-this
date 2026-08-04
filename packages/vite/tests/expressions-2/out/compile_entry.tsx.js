// /packages/vite/tests/expressions-1/entry.tsx: {"setTimeout", "doPromise", "css", "Promise", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-y789mr");
a.css = `background: ${doPromise()};`;
const cssSourcemapData = [{className:'a-y789mr',start:162,end:198}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-1/entry.tsx.css').resolve([
`.a-y789mr {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-1/entry.tsx.css');


// /packages/vite/tests/expressions-2/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-kde34p");
a.css = `margin: ${() => 99}px;`;
const cssSourcemapData = [{className:'a-kde34p',start:51,end:82}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-2/entry.tsx.css').resolve([
`.a-kde34p {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/expressions-2/entry.tsx.css');
