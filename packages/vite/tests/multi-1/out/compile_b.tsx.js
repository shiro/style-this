"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"]['color'];
let exported = new String("exported-9qr0lu");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-1/b.tsx.css', [
`.exported-9qr0lu {
${exported.css}
}`
].join('\n'));