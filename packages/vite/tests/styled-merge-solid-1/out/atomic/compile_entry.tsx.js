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
return {
"__styleThis_var_Base_4": __styleThis_var_Base_4.css,
"__styleThis_var_Extended_2": __styleThis_var_Extended_2.css,
"override": override.css
};
