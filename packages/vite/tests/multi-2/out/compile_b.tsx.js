"use strict";
const originalColor = __styleThis_dddeefff["/c.tsx"]["color"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-wpmbcx");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx.css', [
`.exported-wpmbcx {
${exported.css}
}`
].join('\n'));