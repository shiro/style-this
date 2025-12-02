"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-wh2v8d");
shared.css = `margin: ${num}px;`;

global.__styleThis_dddeefff["/shared.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx.css', [
`.shared-wh2v8d {
${shared.css}
}`
].join('\n'));

// entry:
"use strict";
const num = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let a = new String("a-3452n4");
a.css = `margin: ${num}px;`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/entry-1.tsx.css', [
`.a-3452n4 {
${a.css}
}`
].join('\n'));