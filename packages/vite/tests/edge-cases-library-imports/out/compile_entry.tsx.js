// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"css", "num", "a"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-fody7g");
a.css = `margin: ${num}px;`;
const cssSourcemapData = [{className:'a-fody7g',start:83,end:109}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.css').resolve([
`.a-fody7g {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-1.tsx.css');


// /packages/vite/tests/edge-cases-1/entry-2.tsx: {"b", "css", "num"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let b = new String("b-d2joxu");
b.css = `margin: ${num}px;`;
const cssSourcemapData = [{className:'b-d2joxu',start:83,end:109}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-2.tsx.css').resolve([
`.b-d2joxu {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-2.tsx.css');


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"css", "Math", "shared", "num"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-52bkdy");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};

// /packages/vite/tests/edge-cases-1/shared.tsx: {"css", "Math", "shared", "num"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
let shared = new String("shared-52bkdy");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};const cssSourcemapData = [{className:'shared-52bkdy',start:91,end:117}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/shared.tsx.css').resolve([
`.shared-52bkdy {
${shared.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/shared.tsx.css');


// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"a", "css", "getNumber"}
"use strict";
const getNumber = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-wtyj0x");
a.css = `margin: ${getNumber()};`;
const cssSourcemapData = [{className:'a-wtyj0x',start:627,end:659}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-library-imports/entry.tsx.css').resolve([
`.a-wtyj0x {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-library-imports/entry.tsx.css');


// /packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js (/packages/vite/tests/edge-cases-library-imports/entry.tsx): {"getNumber"}
"use strict";
let getNumber = () => 99;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};