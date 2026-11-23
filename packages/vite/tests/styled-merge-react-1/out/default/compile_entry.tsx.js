// /packages/vite/tests/styled-merge-react-1/entry.tsx: {"__styleThis__css", "css", "override"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let override = new String("override-w9ezgl");
override.css = `background: blue;`;
let __styleThis_var_Extended_2 = new String("Extended-ir85yz");
__styleThis_var_Extended_2.css = `padding: 16px;
  color: red;`;
let __styleThis_var_Base_4 = new String("Base-ajwd67");
__styleThis_var_Base_4.css = `background: none;
  padding: 8px;`;
return [
`.Base-ajwd67 {
${__styleThis_var_Base_4.css}
}`,
`.Extended-ir85yz {
${__styleThis_var_Extended_2.css}
}`,
`.override-w9ezgl {
${override.css}
}`
].join('\n');
