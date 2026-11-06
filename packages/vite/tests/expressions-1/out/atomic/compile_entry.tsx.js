// /packages/vite/tests/expressions-1/entry.tsx: {"Promise", "a", "css", "doPromise", "setTimeout"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
let a = new String("a-f45qro");
a.css = `background: ${doPromise()};`;
return {
"a": a.css
};
