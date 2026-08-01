// /packages/vite/tests/styled-components-solid-1/entry.tsx: {"unrelated", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-3slijs");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-c5iro5)"}px;`;
let unrelated = new String("unrelated-96jgdy");
unrelated.css = `background: none;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-solid-1/entry.tsx.css').resolve([
`.FancyButton-3slijs {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-96jgdy {
${unrelated.css}
}`
].join('\n'));
