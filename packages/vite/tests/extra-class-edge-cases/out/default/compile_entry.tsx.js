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
