// /packages/vite/tests/extra-class-1/entry.tsx: {"b", "css", "extraClass", "a"}
const a = new String('a-chuvkp');
const b = new String('b-1iv0ta');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
a.css = `background: red;
  `;
b.css = `color: blue;
  `;
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

const cssSourcemapData = [{className:'a-chuvkp',start:63,end:115},{className:'b-1iv0ta',start:128,end:172}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-chuvkp {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`,
`.b-1iv0ta {\n${extractNonAtomicCss(b.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/extra-class-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-chuvkp' + ' ' + _a_atomic + '";' + '\n' + 'export const _styleThis_b = "' + 'b-1iv0ta' + ' ' + _b_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-1/entry.tsx.style-this.js').resolve(styleThisModule);
