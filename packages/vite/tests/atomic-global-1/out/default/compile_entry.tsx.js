// /packages/vite/tests/atomic-global-1/entry.tsx: {"mainStyle", "_GlobalMain", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let mainStyle = new String("mainStyle-wheb81");
mainStyle.css = `background: red;
  padding: 20px;`;
let _GlobalMain = new String("_GlobalMain");
_GlobalMain.css = `.Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'mainStyle-wheb81',start:110,end:152},{className:'_GlobalMain',start:211,end:367}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-global-1/entry.tsx.css').resolve([
`.mainStyle-wheb81 {
${mainStyle.css}
}`,
`${_GlobalMain.css}
`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-global-1/entry.tsx.css');


// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"innerStyle", "css", "outerStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let innerStyle = new String("innerStyle-2zo1az");
innerStyle.css = `background: red;
  padding: 10px;`;
let outerStyle = new String("outerStyle-z41ifw");
outerStyle.css = `width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'innerStyle-2zo1az',start:130,end:172},{className:'outerStyle-z41ifw',start:308,end:460}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.css').resolve([
`.innerStyle-2zo1az {
${innerStyle.css}
}`,
`.outerStyle-z41ifw {
${outerStyle.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-media-query-1/entry.tsx.css');


// /packages/vite/tests/atomic-media-query-1/entry.tsx: {"innerStyle", "outerStyle", "css"}
const innerStyle = new String('innerStyle-2zo1az');
const outerStyle = new String('outerStyle-z41ifw');
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

const cssSourcemapData = [{className:'innerStyle-2zo1az',start:130,end:172},{className:'outerStyle-z41ifw',start:308,end:460}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.innerStyle-2zo1az {\n${extractNonAtomicCss(innerStyle.css)||'/* atomized */'}\n}`,
`.outerStyle-z41ifw {\n${extractNonAtomicCss(outerStyle.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/atomic-media-query-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_innerStyle = "' + 'innerStyle-2zo1az' + ' ' + _innerStyle_atomic + '";' + '\n' + 'export const _styleThis_outerStyle = "' + 'outerStyle-z41ifw' + ' ' + _outerStyle_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/atomic-media-query-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/basic-1/entry.tsx: {"a", "css"}
const a = new String('a-q3g9a7');
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

const cssSourcemapData = [{className:'a-q3g9a7',start:51,end:76}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-q3g9a7 {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-q3g9a7' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/basic-1/entry.tsx: {"css", "a"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-q3g9a7");
a.css = `background: red;`;
const cssSourcemapData = [{className:'a-q3g9a7',start:51,end:76}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-1/entry.tsx.css').resolve([
`.a-q3g9a7 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/basic-1/entry.tsx.css');


// /packages/vite/tests/basic-2/entry.tsx: {"b", "foo", "css", "a"}
const a = new String('a-ole3wx');
const b = new String('b-r4x6jg');
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

const cssSourcemapData = [{className:'a-ole3wx',start:70,end:98},{className:'b-r4x6jg',start:110,end:138}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-ole3wx {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`,
`.b-r4x6jg {\n${extractNonAtomicCss(b.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/basic-2/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-ole3wx' + ' ' + _a_atomic + '";' + '\n' + 'export const _styleThis_b = "' + 'b-r4x6jg' + ' ' + _b_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/basic-2/entry.tsx.style-this.js').resolve(styleThisModule);
