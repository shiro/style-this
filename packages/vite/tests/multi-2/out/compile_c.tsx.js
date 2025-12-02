"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/c.tsx"]['color'];
let exported = new String("exported-mnc5er");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx.css', [
`.exported-mnc5er {
${exported.css}
}`
].join('\n'));