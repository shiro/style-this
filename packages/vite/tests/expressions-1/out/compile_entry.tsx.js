"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-k5yr8p");
a.css = `background: ${doPromise()};`;

__styleThis_aabbbccc.set('/entry.tsx.css', [
`.a-k5yr8p {
${a.css}
}`
].join('\n'));