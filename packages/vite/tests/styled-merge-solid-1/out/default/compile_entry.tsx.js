// /packages/vite/tests/styled-merge-solid-1/entry.tsx: {"css", "override"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_Base_4 = new String("Base-fw9e3s");
__styleThis_var_Base_4.css = `background: none;
  padding: 8px;`;
let __styleThis_var_Extended_2 = new String("Extended-bs963c");
__styleThis_var_Extended_2.css = `padding: 16px;
  color: red;`;
let override = new String("override-k1mzgd");
override.css = `background: blue;`;
const cssSourcemapData = [{className:'Base-fw9e3s',start:105,end:157},{className:'Extended-bs963c',start:255,end:301},{className:'override-k1mzgd',start:328,end:354}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/styled-merge-solid-1/entry.tsx.css').resolve([
`.Base-fw9e3s {
${__styleThis_var_Base_4.css}
}`,
`.Extended-bs963c {
${__styleThis_var_Extended_2.css}
}`,
`.override-k1mzgd {
${override.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/styled-merge-solid-1/entry.tsx.css');
