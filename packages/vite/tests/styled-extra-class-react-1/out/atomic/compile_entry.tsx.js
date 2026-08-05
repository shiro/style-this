// /packages/vite/tests/styled-extra-class-react-1/entry.tsx: {"css", "extraClass", "unrelated"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-bsxab0 custom-button primary");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-vklyb0)"}px;
  `;
let unrelated = new String("unrelated-l2rcte test-class");
unrelated.css = `background: none;
  `;
const cssSourcemapData = [{className:'FancyButton-bsxab0',start:124,end:294},{className:'unrelated-l2rcte',start:315,end:371}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css').resolve([
`.FancyButton-bsxab0 {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-l2rcte {
${unrelated.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css');


// /packages/vite/tests/styled-extra-class-react-1/entry.tsx: {"unrelated", "css", "extraClass"}
const __styleThis_var_FancyButton_2 = new String('FancyButton-bsxab0');
const unrelated = new String('unrelated-l2rcte');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-vklyb0)"}px;
  `;
unrelated.css = `background: none;
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
if (!__styleThis_var_FancyButton_2.css) { console.error('[atomic] __styleThis_var_FancyButton_2.css is undefined'); __styleThis_var_FancyButton_2.css = ''; }
const ___styleThis_var_FancyButton_2_atomic = cssToAtomicClassList(__styleThis_var_FancyButton_2.css);
if (!unrelated.css) { console.error('[atomic] unrelated.css is undefined'); unrelated.css = ''; }
const _unrelated_atomic = cssToAtomicClassList(unrelated.css);

const cssSourcemapData = [{className:'FancyButton-bsxab0',start:124,end:294},{className:'unrelated-l2rcte',start:315,end:371}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.FancyButton-bsxab0 {\n${extractNonAtomicCss(__styleThis_var_FancyButton_2.css)||'/* atomized */'}\n}`,
`.unrelated-l2rcte {\n${extractNonAtomicCss(unrelated.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_var_FancyButton_2 = "' + 'FancyButton-bsxab0' + ' ' + ___styleThis_var_FancyButton_2_atomic + '";' + '\n' + 'export const _styleThis_unrelated = "' + 'unrelated-l2rcte' + ' ' + _unrelated_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-extra-class-react-1/entry.tsx.style-this.js').resolve(styleThisModule);
