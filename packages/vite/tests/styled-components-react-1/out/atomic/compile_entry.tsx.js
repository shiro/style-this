// /packages/vite/tests/styled-components-react-1/entry.tsx: {"unrelated", "css"}
const __styleThis_var_FancyButton_2 = new String('FancyButton-t6j09m');
const unrelated = new String('unrelated-2rc96v');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-2nwhuj)"}px;`;
unrelated.css = `background: none;`;
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
if (!__styleThis_var_FancyButton_2.css) { console.error('[atomic] __styleThis_var_FancyButton_2.css is undefined'); __styleThis_var_FancyButton_2.css = ''; }
const ___styleThis_var_FancyButton_2_atomic = cssToAtomicClassList(__styleThis_var_FancyButton_2.css);
if (!unrelated.css) { console.error('[atomic] unrelated.css is undefined'); unrelated.css = ''; }
const _unrelated_atomic = cssToAtomicClassList(unrelated.css);

const cssSourcemapData = [{className:'FancyButton-t6j09m',start:112,end:241},{className:'unrelated-2rc96v',start:262,end:288}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.FancyButton-t6j09m {\n${extractNonAtomicCss(__styleThis_var_FancyButton_2.css)||'/* atomized */'}\n}`,
`.unrelated-2rc96v {\n${extractNonAtomicCss(unrelated.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-react-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/styled-components-react-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_var_FancyButton_2 = "' + 'FancyButton-t6j09m' + ' ' + ___styleThis_var_FancyButton_2_atomic + '";' + '\n' + 'export const _styleThis_unrelated = "' + 'unrelated-2rc96v' + ' ' + _unrelated_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-react-1/entry.tsx.style-this.js').resolve(styleThisModule);
