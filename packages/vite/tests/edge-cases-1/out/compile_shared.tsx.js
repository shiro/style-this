"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let num = global.__styleThis_dddeefff["/shared.tsx"]['num'];
let shared = new String("shared-wh2v8d");
shared.css = `margin: ${num}px;`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/edge-cases-1/shared.tsx.css', [
`.shared-wh2v8d {
${shared.css}
}`
].join('\n'));