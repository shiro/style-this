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
