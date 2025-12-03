"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"]['color'];
let exported = new String("exported-iv0de3");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-2/c.tsx.css', [
`.exported-iv0de3 {
${exported.css}
}`
].join('\n'));