// /packages/vite/tests/styled-extra-class-react-1/entry.tsx: {"css", "unrelated", "extraClass"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-3gdav0 custom-button primary");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-vklyb0)"}px;
  `;
let unrelated = new String("unrelated-l2f4xi test-class");
unrelated.css = `background: none;
  `;
__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-extra-class-react-1/entry.tsx.css').resolve([
`.FancyButton-3gdav0 {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-l2f4xi {
${unrelated.css}
}`
].join('\n'));
