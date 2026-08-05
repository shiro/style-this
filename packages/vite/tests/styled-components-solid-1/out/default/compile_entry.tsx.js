// /packages/vite/tests/styled-components-solid-1/entry.tsx: {"unrelated", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-mr0hyf");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-c5iro5)"}px;`;
let unrelated = new String("unrelated-o9y7wh");
unrelated.css = `background: none;`;
const cssSourcemapData = [{className:'FancyButton-mr0hyf',start:112,end:241},{className:'unrelated-o9y7wh',start:262,end:288}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-solid-1/entry.tsx.css').resolve([
`.FancyButton-mr0hyf {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-o9y7wh {
${unrelated.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/styled-components-solid-1/entry.tsx.css');
