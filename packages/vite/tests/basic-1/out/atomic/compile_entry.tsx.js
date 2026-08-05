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
