// /packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx: {"Base", "__styleThis__css", "cx"}
"use strict";
let { css: cx } = require("/packages/core/dist/index.mjs");
let Base = new String("Base-7open0");
Base.css = `color: blue;`;
let __styleThis_var_FancyButton_2 = new String("FancyButton-e781ej");
__styleThis_var_FancyButton_2.css = `background: none;`;
return [
`.Base-7open0 {
${Base.css}
}`,
`.FancyButton-e781ej {
${__styleThis_var_FancyButton_2.css}
}`
].join('\n');
