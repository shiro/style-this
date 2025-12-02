"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/b.tsx"]['color'];
let exported = new String("exported-k9u78p");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx.css', [
`.exported-k9u78p {
${exported.css}
}`
].join('\n'));