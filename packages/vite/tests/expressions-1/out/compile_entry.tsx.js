"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-y789mr");
a.css = `background: ${doPromise()};`;

__styleThis_aabbbccc.set('/packages/vite/tests/expressions-1/entry.tsx.css', [
`.a-y789mr {
${a.css}
}`
].join('\n'));