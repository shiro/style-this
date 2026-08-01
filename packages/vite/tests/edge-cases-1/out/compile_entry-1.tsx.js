// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"css", "num", "a"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-gxu385");
a.css = `margin: ${num}px;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.css').resolve([
`.a-gxu385 {
${a.css}
}`
].join('\n'));


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"shared", "css", "Math", "num"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};