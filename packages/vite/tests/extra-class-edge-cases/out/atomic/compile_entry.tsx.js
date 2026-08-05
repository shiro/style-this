// /packages/vite/tests/extra-class-edge-cases/entry.tsx: {"test5", "test4", "test2", "css", "extraClass", "test1", "test3", "test6", "test7"}
const test1 = new String('test1-mjkxqr');
const test2 = new String('test2-laf49q');
const test3 = new String('test3-fg1mnw');
const test4 = new String('test4-05ej4p');
const __styleThis_var_ParentStyled_4 = new String('ParentStyled-rox6v0');
const __styleThis_var_ChildStyled_2 = new String('ChildStyled-vkdq34');
const test5 = new String('test5-wpmjod');
const test6 = new String('test6-fglmzo');
const test7 = new String('test7-2zsxyf');
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

const cssSourcemapData = [{className:'test1-mjkxqr',start:158,end:228},{className:'test2-laf49q',start:281,end:349},{className:'test3-fg1mnw',start:415,end:451},{className:'test4-05ej4p',start:516,end:658},{className:'ParentStyled-rox6v0',start:745,end:829},{className:'ChildStyled-vkdq34',start:852,end:950},{className:'test5-wpmjod',start:1008,end:1143},{className:'test6-fglmzo',start:1180,end:1244},{className:'test7-2zsxyf',start:1276,end:1325}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.test1-mjkxqr {\n${extractNonAtomicCss(test1.css)||'/* atomized */'}\n}`,
`.test2-laf49q {\n${extractNonAtomicCss(test2.css)||'/* atomized */'}\n}`,
`.test3-fg1mnw {\n${extractNonAtomicCss(test3.css)||'/* atomized */'}\n}`,
`.test4-05ej4p {\n${extractNonAtomicCss(test4.css)||'/* atomized */'}\n}`,
`.ParentStyled-rox6v0 {\n${extractNonAtomicCss(__styleThis_var_ParentStyled_4.css)||'/* atomized */'}\n}`,
`.ChildStyled-vkdq34 {\n${extractNonAtomicCss(__styleThis_var_ChildStyled_2.css)||'/* atomized */'}\n}`,
`.test5-wpmjod {\n${extractNonAtomicCss(test5.css)||'/* atomized */'}\n}`,
`.test6-fglmzo {\n${extractNonAtomicCss(test6.css)||'/* atomized */'}\n}`,
`.test7-2zsxyf {\n${extractNonAtomicCss(test7.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/extra-class-edge-cases/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_test1 = "' + 'test1-mjkxqr' + ' ' + _test1_atomic + '";' + '\n' + 'export const _styleThis_test2 = "' + 'test2-laf49q' + ' ' + _test2_atomic + '";' + '\n' + 'export const _styleThis_test3 = "' + 'test3-fg1mnw' + ' ' + _test3_atomic + '";' + '\n' + 'export const _styleThis_test4 = "' + 'test4-05ej4p' + ' ' + _test4_atomic + '";' + '\n' + 'export const _styleThis_var_ParentStyled_4 = "' + 'ParentStyled-rox6v0' + ' ' + ___styleThis_var_ParentStyled_4_atomic + '";' + '\n' + 'export const _styleThis_var_ChildStyled_2 = "' + 'ChildStyled-vkdq34' + ' ' + ___styleThis_var_ChildStyled_2_atomic + '";' + '\n' + 'export const _styleThis_test5 = "' + 'test5-wpmjod' + ' ' + _test5_atomic + '";' + '\n' + 'export const _styleThis_test6 = "' + 'test6-fglmzo' + ' ' + _test6_atomic + '";' + '\n' + 'export const _styleThis_test7 = "' + 'test7-2zsxyf' + ' ' + _test7_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/extra-class-edge-cases/entry.tsx: {"test6", "test1", "extraClass", "test5", "test7", "test4", "test3", "css", "test2"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let test1 = new String("test1-mjkxqr beginning");
test1.css = `background: red;
  color: white;`;
let test2 = new String("test2-laf49q ending");
test2.css = `background: blue;
  color: black;
  `;
let test3 = new String("test3-fg1mnw only-thing");
test3.css = ``;
let test4 = new String("test4-05ej4p first second third fourth");
test4.css = `background: green;
  
  padding: 10px;
  
  margin: 5px;
  `;
let __styleThis_var_ParentStyled_4 = new String("ParentStyled-rox6v0 parent-class");
__styleThis_var_ParentStyled_4.css = `background: yellow;
  
  padding: 20px;`;
let __styleThis_var_ChildStyled_2 = new String("ChildStyled-vkdq34 child-class");
__styleThis_var_ChildStyled_2.css = `color: purple;
  
  border: 1px solid black;`;
let test5 = new String("test5-wpmjod class1 class2 class3 class4 class5");
test5.css = `display: flex;
  
  
  padding: 1rem;`;
let test6 = new String("test6-fglmzo");
test6.css = `background: orange;
  
  color: white;`;
let test7 = new String("test7-2zsxyf");
test7.css = `background: pink;
  `;
const cssSourcemapData = [{className:'test1-mjkxqr',start:158,end:228},{className:'test2-laf49q',start:281,end:349},{className:'test3-fg1mnw',start:415,end:451},{className:'test4-05ej4p',start:516,end:658},{className:'ParentStyled-rox6v0',start:745,end:829},{className:'ChildStyled-vkdq34',start:852,end:950},{className:'test5-wpmjod',start:1008,end:1143},{className:'test6-fglmzo',start:1180,end:1244},{className:'test7-2zsxyf',start:1276,end:1325}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/extra-class-edge-cases/entry.tsx.css').resolve([
`.test1-mjkxqr {
${test1.css}
}`,
`.test2-laf49q {
${test2.css}
}`,
`.test3-fg1mnw {
${test3.css}
}`,
`.test4-05ej4p {
${test4.css}
}`,
`.ParentStyled-rox6v0 {
${__styleThis_var_ParentStyled_4.css}
}`,
`.ChildStyled-vkdq34 {
${__styleThis_var_ChildStyled_2.css}
}`,
`.test5-wpmjod {
${test5.css}
}`,
`.test6-fglmzo {
${test6.css}
}`,
`.test7-2zsxyf {
${test7.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/extra-class-edge-cases/entry.tsx.css');
