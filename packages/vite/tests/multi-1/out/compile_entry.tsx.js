"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-k9u78p");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx.css', [
`.exported-k9u78p {
${exported.css}
}`
].join('\n'));

// entry:
"use strict";
const color = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let a = new String("a-ns9qb4");
a.css = `background: ${color};`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-1/entry.tsx.css', [
`.a-ns9qb4 {
${a.css}
}`
].join('\n'));