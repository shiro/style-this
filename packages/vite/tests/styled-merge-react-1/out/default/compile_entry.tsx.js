// /packages/vite/tests/styled-merge-react-1/entry.tsx: {"css", "override"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_Base_4 = new String("Base-ajwd67");
__styleThis_var_Base_4.css = `background: none;
  padding: 8px;`;
let __styleThis_var_Extended_2 = new String("Extended-ir85yz");
__styleThis_var_Extended_2.css = `padding: 16px;
  color: red;`;
let override = new String("override-w9ezgl");
override.css = `background: blue;`;
const cssSourcemapData = [{className:'Base-ajwd67',start:105,end:157},{className:'Extended-ir85yz',start:255,end:301},{className:'override-w9ezgl',start:328,end:354}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/styled-merge-react-1/entry.tsx.css').resolve([
`.Base-ajwd67 {
${__styleThis_var_Base_4.css}
}`,
`.Extended-ir85yz {
${__styleThis_var_Extended_2.css}
}`,
`.override-w9ezgl {
${override.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/styled-merge-react-1/entry.tsx.css');
