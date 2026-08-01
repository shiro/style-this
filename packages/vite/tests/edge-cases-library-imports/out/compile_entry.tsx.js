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


// /packages/vite/tests/edge-cases-1/entry-2.tsx: {"css", "num", "b"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let b = new String("b-w56741");
b.css = `margin: ${num}px;`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-2.tsx.css').resolve([
`.b-w56741 {
${b.css}
}`
].join('\n'));


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"shared", "css", "Math", "num"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};

// /packages/vite/tests/edge-cases-1/shared.tsx: {"css", "shared", "num", "Math"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/shared.tsx.css').resolve([
`.shared-ar0tez {
${shared.css}
}`
].join('\n'));


// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"css", "a", "getNumber"}
"use strict";
const getNumber = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-tej8d6");
a.css = `margin: ${getNumber()};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-library-imports/entry.tsx.css').resolve([
`.a-tej8d6 {
${a.css}
}`
].join('\n'));


// /packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js (/packages/vite/tests/edge-cases-library-imports/entry.tsx): {"getNumber"}
"use strict";
let getNumber = () => 99;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};