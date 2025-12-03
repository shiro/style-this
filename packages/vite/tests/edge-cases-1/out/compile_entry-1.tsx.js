"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-52bkdy");
shared.css = `margin: ${num}px;`;

global.__styleThis_dddeefff["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};
__styleThis_aabbbccc.set('/packages/vite/tests/edge-cases-1/shared.tsx.css', [
`.shared-52bkdy {
${shared.css}
}`
].join('\n'));

// virtual program:
"use strict";
const num = __styleThis_dddeefff["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-fody7g");
a.css = `margin: ${num}px;`;

__styleThis_aabbbccc.set('/packages/vite/tests/edge-cases-1/entry-1.tsx.css', [
`.a-fody7g {
${a.css}
}`
].join('\n'));