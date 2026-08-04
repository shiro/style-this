// /packages/vite/tests/atomic-global-1/entry.tsx: {"_GlobalMain", "css", "mainStyle"}
const mainStyle = new String('mainStyle-74hqzc');
const _GlobalMain = new String('_GlobalMain');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
mainStyle.css = `background: red;
  padding: 20px;`;
_GlobalMain.css = `.Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }`;
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
if (!mainStyle.css) { console.error('[atomic] mainStyle.css is undefined'); mainStyle.css = ''; }
const _mainStyle_atomic = cssToAtomicClassList(mainStyle.css);

const cssSourcemapData = [{className:'mainStyle-74hqzc',start:110,end:152},{className:'_GlobalMain',start:211,end:367}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`${_GlobalMain.css}
`, `.mainStyle-74hqzc {\n${extractNonAtomicCss(mainStyle.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-global-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/atomic-global-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_mainStyle = "' + 'mainStyle-74hqzc' + ' ' + _mainStyle_atomic + '";' + '\n' + 'export const _styleThis__GlobalMain = "' + '_GlobalMain' + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-global-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"outerStyle", "innerStyle", "css"}
const innerStyle = new String('innerStyle-oty7sd');
const outerStyle = new String('outerStyle-mvwhqz');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
innerStyle.css = `background: red;
  padding: 10px;`;
outerStyle.css = `width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }`;
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
if (!innerStyle.css) { console.error('[atomic] innerStyle.css is undefined'); innerStyle.css = ''; }
const _innerStyle_atomic = cssToAtomicClassList(innerStyle.css);
if (!outerStyle.css) { console.error('[atomic] outerStyle.css is undefined'); outerStyle.css = ''; }
const _outerStyle_atomic = cssToAtomicClassList(outerStyle.css);

const cssSourcemapData = [{className:'innerStyle-oty7sd',start:130,end:172},{className:'outerStyle-mvwhqz',start:308,end:460}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.innerStyle-oty7sd {\n${extractNonAtomicCss(innerStyle.css)||'/* atomized */'}\n}`,
`.outerStyle-mvwhqz {\n${extractNonAtomicCss(outerStyle.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/atomic-media-query-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_innerStyle = "' + 'innerStyle-oty7sd' + ' ' + _innerStyle_atomic + '";' + '\n' + 'export const _styleThis_outerStyle = "' + 'outerStyle-mvwhqz' + ' ' + _outerStyle_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-xezolq");
a.css = `background: red;`;
const cssSourcemapData = [{className:'a-xezolq',start:51,end:76}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-xezolq {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');


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
