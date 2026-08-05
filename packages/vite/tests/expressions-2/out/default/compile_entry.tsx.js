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


// /packages/vite/tests/expressions-1/entry.tsx: {"css", "doPromise", "setTimeout", "a", "Promise"}
const a = new String('a-f45qro');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
a.css = `background: ${doPromise()};`;
// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!a.css) { console.error('[atomic] a.css is undefined'); a.css = ''; }
const _a_atomic = cssToAtomicClassList(a.css);

const cssSourcemapData = [{className:'a-f45qro',start:162,end:198}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-f45qro {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/expressions-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-f45qro' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/expressions-1/entry.tsx.style-this.js').resolve(styleThisModule);


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
