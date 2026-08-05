// /packages/vite/tests/styled-components-react-1/entry.tsx: {"unrelated", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_FancyButton_2 = new String("FancyButton-t6j09m");
__styleThis_var_FancyButton_2.css = `background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${"var(--var1-2nwhuj)"}px;`;
let unrelated = new String("unrelated-2rc96v");
unrelated.css = `background: none;`;
const cssSourcemapData = [{className:'FancyButton-t6j09m',start:112,end:241},{className:'unrelated-2rc96v',start:262,end:288}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/styled-components-react-1/entry.tsx.css').resolve([
`.FancyButton-t6j09m {
${__styleThis_var_FancyButton_2.css}
}`,
`.unrelated-2rc96v {
${unrelated.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/styled-components-react-1/entry.tsx.css');
