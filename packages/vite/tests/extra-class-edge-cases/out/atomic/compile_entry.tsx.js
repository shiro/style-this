// /packages/vite/tests/extra-class-edge-cases/entry.tsx: {"test2", "css", "test5", "test7", "test6", "extraClass", "test4", "test1", "test3"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let test1 = new String("test1-6z85mr beginning");
test1.css = `background: red;
  color: white;`;
let test2 = new String("test2-rkpq3k ending");
test2.css = `background: blue;
  color: black;
  `;
let test3 = new String("test3-mvkpe7 only-thing");
test3.css = ``;
let test4 = new String("test4-cxebwl first second third fourth");
test4.css = `background: green;
  
  padding: 10px;
  
  margin: 5px;
  `;
let __styleThis_var_ParentStyled_4 = new String("ParentStyled-difgta parent-class");
__styleThis_var_ParentStyled_4.css = `background: yellow;
  
  padding: 20px;`;
let __styleThis_var_ChildStyled_2 = new String("ChildStyled-hyrg5m child-class");
__styleThis_var_ChildStyled_2.css = `color: purple;
  
  border: 1px solid black;`;
let test5 = new String("test5-9ibg5y class1 class2 class3 class4 class5");
test5.css = `display: flex;
  
  
  padding: 1rem;`;
let test6 = new String("test6-9e3s16");
test6.css = `background: orange;
  
  color: white;`;
let test7 = new String("test7-ijc9m3");
test7.css = `background: pink;
  `;
const cssSourcemapData = [{className:'test1-6z85mr',start:158,end:228},{className:'test2-rkpq3k',start:281,end:349},{className:'test3-mvkpe7',start:415,end:451},{className:'test4-cxebwl',start:516,end:658},{className:'ParentStyled-difgta',start:745,end:829},{className:'ChildStyled-hyrg5m',start:852,end:950},{className:'test5-9ibg5y',start:1008,end:1143},{className:'test6-9e3s16',start:1180,end:1244},{className:'test7-ijc9m3',start:1276,end:1325}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.css').resolve([
`.test1-6z85mr {
${test1.css}
}`,
`.test2-rkpq3k {
${test2.css}
}`,
`.test3-mvkpe7 {
${test3.css}
}`,
`.test4-cxebwl {
${test4.css}
}`,
`.ParentStyled-difgta {
${__styleThis_var_ParentStyled_4.css}
}`,
`.ChildStyled-hyrg5m {
${__styleThis_var_ChildStyled_2.css}
}`,
`.test5-9ibg5y {
${test5.css}
}`,
`.test6-9e3s16 {
${test6.css}
}`,
`.test7-ijc9m3 {
${test7.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/extra-class-edge-cases/entry.tsx.css');


// /packages/vite/tests/extra-class-edge-cases/entry.tsx: {"test5", "test4", "css", "test3", "test1", "test2", "extraClass", "test7", "test6"}
const test1 = new String('test1-6z85mr');
const test2 = new String('test2-rkpq3k');
const test3 = new String('test3-mvkpe7');
const test4 = new String('test4-cxebwl');
const __styleThis_var_ParentStyled_4 = new String('ParentStyled-difgta');
const __styleThis_var_ChildStyled_2 = new String('ChildStyled-hyrg5m');
const test5 = new String('test5-9ibg5y');
const test6 = new String('test6-9e3s16');
const test7 = new String('test7-ijc9m3');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
test1.css = `background: red;
  color: white;`;
test2.css = `background: blue;
  color: black;
  `;
test3.css = ``;
test4.css = `background: green;
  
  padding: 10px;
  
  margin: 5px;
  `;
__styleThis_var_ParentStyled_4.css = `background: yellow;
  
  padding: 20px;`;
__styleThis_var_ChildStyled_2.css = `color: purple;
  
  border: 1px solid black;`;
test5.css = `display: flex;
  
  
  padding: 1rem;`;
test6.css = `background: orange;
  
  color: white;`;
test7.css = `background: pink;
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
if (!test1.css) { console.error('[atomic] test1.css is undefined'); test1.css = ''; }
const _test1_atomic = cssToAtomicClassList(test1.css);
if (!test2.css) { console.error('[atomic] test2.css is undefined'); test2.css = ''; }
const _test2_atomic = cssToAtomicClassList(test2.css);
if (!test3.css) { console.error('[atomic] test3.css is undefined'); test3.css = ''; }
const _test3_atomic = cssToAtomicClassList(test3.css);
if (!test4.css) { console.error('[atomic] test4.css is undefined'); test4.css = ''; }
const _test4_atomic = cssToAtomicClassList(test4.css);
if (!__styleThis_var_ParentStyled_4.css) { console.error('[atomic] __styleThis_var_ParentStyled_4.css is undefined'); __styleThis_var_ParentStyled_4.css = ''; }
const ___styleThis_var_ParentStyled_4_atomic = cssToAtomicClassList(__styleThis_var_ParentStyled_4.css);
if (!__styleThis_var_ChildStyled_2.css) { console.error('[atomic] __styleThis_var_ChildStyled_2.css is undefined'); __styleThis_var_ChildStyled_2.css = ''; }
const ___styleThis_var_ChildStyled_2_atomic = cssToAtomicClassList(__styleThis_var_ChildStyled_2.css);
if (!test5.css) { console.error('[atomic] test5.css is undefined'); test5.css = ''; }
const _test5_atomic = cssToAtomicClassList(test5.css);
if (!test6.css) { console.error('[atomic] test6.css is undefined'); test6.css = ''; }
const _test6_atomic = cssToAtomicClassList(test6.css);
if (!test7.css) { console.error('[atomic] test7.css is undefined'); test7.css = ''; }
const _test7_atomic = cssToAtomicClassList(test7.css);

const cssSourcemapData = [{className:'test1-6z85mr',start:158,end:228},{className:'test2-rkpq3k',start:281,end:349},{className:'test3-mvkpe7',start:415,end:451},{className:'test4-cxebwl',start:516,end:658},{className:'ParentStyled-difgta',start:745,end:829},{className:'ChildStyled-hyrg5m',start:852,end:950},{className:'test5-9ibg5y',start:1008,end:1143},{className:'test6-9e3s16',start:1180,end:1244},{className:'test7-ijc9m3',start:1276,end:1325}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.test1-6z85mr {\n${extractNonAtomicCss(test1.css)||'/* atomized */'}\n}`,
`.test2-rkpq3k {\n${extractNonAtomicCss(test2.css)||'/* atomized */'}\n}`,
`.test3-mvkpe7 {\n${extractNonAtomicCss(test3.css)||'/* atomized */'}\n}`,
`.test4-cxebwl {\n${extractNonAtomicCss(test4.css)||'/* atomized */'}\n}`,
`.ParentStyled-difgta {\n${extractNonAtomicCss(__styleThis_var_ParentStyled_4.css)||'/* atomized */'}\n}`,
`.ChildStyled-hyrg5m {\n${extractNonAtomicCss(__styleThis_var_ChildStyled_2.css)||'/* atomized */'}\n}`,
`.test5-9ibg5y {\n${extractNonAtomicCss(test5.css)||'/* atomized */'}\n}`,
`.test6-9e3s16 {\n${extractNonAtomicCss(test6.css)||'/* atomized */'}\n}`,
`.test7-ijc9m3 {\n${extractNonAtomicCss(test7.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/extra-class-edge-cases/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_test1 = "' + 'test1-6z85mr' + ' ' + _test1_atomic + '";' + '\n' + 'export const _styleThis_test2 = "' + 'test2-rkpq3k' + ' ' + _test2_atomic + '";' + '\n' + 'export const _styleThis_test3 = "' + 'test3-mvkpe7' + ' ' + _test3_atomic + '";' + '\n' + 'export const _styleThis_test4 = "' + 'test4-cxebwl' + ' ' + _test4_atomic + '";' + '\n' + 'export const _styleThis_var_ParentStyled_4 = "' + 'ParentStyled-difgta' + ' ' + ___styleThis_var_ParentStyled_4_atomic + '";' + '\n' + 'export const _styleThis_var_ChildStyled_2 = "' + 'ChildStyled-hyrg5m' + ' ' + ___styleThis_var_ChildStyled_2_atomic + '";' + '\n' + 'export const _styleThis_test5 = "' + 'test5-9ibg5y' + ' ' + _test5_atomic + '";' + '\n' + 'export const _styleThis_test6 = "' + 'test6-9e3s16' + ' ' + _test6_atomic + '";' + '\n' + 'export const _styleThis_test7 = "' + 'test7-ijc9m3' + ' ' + _test7_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.style-this.js').resolve(styleThisModule);
