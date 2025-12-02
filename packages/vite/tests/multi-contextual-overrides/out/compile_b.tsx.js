"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/b.tsx"]['color'];
let inner = global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"]['inner'];
inner.css = `background: ${color};`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx.css', [
`.inner-6z8pej {
${inner.css}
}`
].join('\n'));