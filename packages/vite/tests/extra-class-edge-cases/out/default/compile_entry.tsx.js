// /packages/vite/tests/extra-class-edge-cases/entry.tsx: {"css", "extraClass", "test1", "test2", "test3", "test4", "test5", "test6", "test7"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let test1 = new String("test1-6z85mr");
test1.css = `background: red;
  color: white;`;
let test2 = new String("test2-rkpq3k");
test2.css = `background: blue;
  color: black;
  `;
let test3 = new String("test3-mvkpe7");
test3.css = ``;
let test4 = new String("test4-cxebwl");
test4.css = `background: green;
  
  padding: 10px;
  
  margin: 5px;
  `;
let test5 = new String("test5-9ibg5y");
test5.css = `display: flex;
  
  
  padding: 1rem;`;
let test6 = new String("test6-9e3s16");
test6.css = `background: orange;
  
  color: white;`;
let test7 = new String("test7-ijc9m3");
test7.css = `background: pink;
  `;
let __styleThis_var_ChildStyled_2 = new String("ChildStyled-hyrg5m");
__styleThis_var_ChildStyled_2.css = `color: purple;
  
  border: 1px solid black;`;
let __styleThis_var_ParentStyled_4 = new String("ParentStyled-difgta");
__styleThis_var_ParentStyled_4.css = `background: yellow;
  
  padding: 20px;`;
return [
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
].join('\n');
