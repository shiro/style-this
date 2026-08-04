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
// Import atomic CSS helper from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!innerStyle.css) { console.error('[atomic] innerStyle.css is undefined'); innerStyle.css = ''; }
const _innerStyle_atomic = cssToAtomicClassList(innerStyle.css);
if (!outerStyle.css) { console.error('[atomic] outerStyle.css is undefined'); outerStyle.css = ''; }
const _outerStyle_atomic = cssToAtomicClassList(outerStyle.css);

const cssSourcemapData = [{className:'innerStyle-oty7sd',start:130,end:172},{className:'outerStyle-mvwhqz',start:308,end:460}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.innerStyle-oty7sd {
${innerStyle.css}
}`,
`.outerStyle-mvwhqz {
${outerStyle.css}
}`].join('\n');
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
