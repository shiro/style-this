// /packages/vite/tests/styled-components-react-1/entry.tsx: {"unrelated", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-b05mnk");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-2nwhuj)"}px;`;
let unrelated = new String("unrelated-hqnklm");
unrelated.css = `background: none;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-react-1/entry.tsx.css').resolve([
`.FancyButton-b05mnk {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-hqnklm {
${unrelated.css}
}`
].join('\n'));
