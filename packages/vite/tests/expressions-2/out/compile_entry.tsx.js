// /packages/vite/tests/expressions-1/entry.tsx: {"Promise", "doPromise", "css", "setTimeout", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-f45qro");
a.css = `background: ${doPromise()};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-1/entry.tsx.css').resolve([
`.a-f45qro {
${a.css}
}`
].join('\n'));


// /packages/vite/tests/expressions-2/entry.tsx: {"a", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-7ohiv8");
a.css = `margin: ${() => 99}px;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-2/entry.tsx.css').resolve([
`.a-7ohiv8 {
${a.css}
}`
].join('\n'));
