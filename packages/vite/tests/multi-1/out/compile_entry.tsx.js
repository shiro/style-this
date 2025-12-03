"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-9qr0lu");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-1/b.tsx.css', [
`.exported-9qr0lu {
${exported.css}
}`
].join('\n'));

// virtual program:
"use strict";
const color = __styleThis_dddeefff["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-5y38xq");
a.css = `background: ${color};`;

__styleThis_aabbbccc.set('/packages/vite/tests/multi-1/entry.tsx.css', [
`.a-5y38xq {
${a.css}
}`
].join('\n'));