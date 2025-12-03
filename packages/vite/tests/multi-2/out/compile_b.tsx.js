"use strict";
const originalColor = __styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-45274t");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-2/b.tsx.css', [
`.exported-45274t {
${exported.css}
}`
].join('\n'));