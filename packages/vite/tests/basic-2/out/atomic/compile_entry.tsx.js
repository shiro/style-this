// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
const a = new String('a-xezolq');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
a.css = `background: red;`;
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

const cssSourcemapData = [{className:'a-xezolq',start:51,end:76}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-xezolq {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-xezolq' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/basic-2/entry.tsx: {"css", "a", "b", "foo"}
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


// /packages/vite/tests/basic-2/entry.tsx: {"foo", "b", "css", "a"}
const a = new String('a-j0523w');
const b = new String('b-w5irkh');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = "red";
a.css = `background: ${foo};`;
b.css = `background: ${foo};`;
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
if (!b.css) { console.error('[atomic] b.css is undefined'); b.css = ''; }
const _b_atomic = cssToAtomicClassList(b.css);

const cssSourcemapData = [{className:'a-j0523w',start:70,end:98},{className:'b-w5irkh',start:110,end:138}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-j0523w {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`,
`.b-w5irkh {\n${extractNonAtomicCss(b.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/basic-2/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-j0523w' + ' ' + _a_atomic + '";' + '\n' + 'export const _styleThis_b = "' + 'b-w5irkh' + ' ' + _b_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.style-this.js').resolve(styleThisModule);
