// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"css", "num", "a"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-gxu385");
a.css = `margin: ${num}px;`;
const cssSourcemapData = [{className:'a-gxu385',start:83,end:109}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.css').resolve([
`.a-gxu385 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-1.tsx.css');


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"num", "shared", "css", "Math"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};