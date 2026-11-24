// /packages/core/dist/index.mjs (/packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx): {"css", "extraClass"}
"use strict";

global.__styleThis_value_cache_ggghhhii["/packages/core/dist/index.mjs"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/core/dist/index.mjs"] ?? {}), };

// /packages/vite/tests/styled-components-solid-aliased-imports/entry.tsx: {"Base", "NsBase", "__styleThis__css", "cx", "st"}
"use strict";
let st = require("/packages/core/dist/index.mjs");
let { css: cx } = require("/packages/core/dist/index.mjs");
let NsBase = new String("NsBase-56jct6");
NsBase.css = `color: red;
  `;
let Base = new String("Base-7open0");
Base.css = `color: blue;`;
let __styleThis_var_FancyButton_2 = new String("FancyButton-e781ej");
__styleThis_var_FancyButton_2.css = `background: none;`;
let __styleThis_var_NsButton_4 = new String("NsButton-pmrsly");
__styleThis_var_NsButton_4.css = `margin: 0;`;
return [
`.NsBase-56jct6 {
${NsBase.css}
}`,
`.NsButton-pmrsly {
${__styleThis_var_NsButton_4.css}
}`,
`.Base-7open0 {
${Base.css}
}`,
`.FancyButton-e781ej {
${__styleThis_var_FancyButton_2.css}
}`
].join('\n');
