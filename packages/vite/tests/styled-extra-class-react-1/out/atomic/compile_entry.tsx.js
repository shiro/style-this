// /packages/vite/tests/styled-extra-class-react-1/entry.tsx: {"css", "extraClass", "unrelated"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-bsxab0 custom-button primary");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-30dyns)"}px;
  `;
let unrelated = new String("unrelated-l2rcte test-class");
unrelated.css = `background: none;
  `;
return {
"__styleThis_var_FancyButton_2": __styleThis_var_FancyButton_2.css,
"unrelated": unrelated.css
};
