// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"a", "css", "getNumber"}
"use strict";
const getNumber = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-wtyj0x");
a.css = `margin: ${getNumber()};`;
const cssSourcemapData = [{className:'a-wtyj0x',start:627,end:659}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/edge-cases-library-imports/entry.tsx.css').resolve([
`.a-wtyj0x {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-library-imports/entry.tsx.css');


// /packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js (/packages/vite/tests/edge-cases-library-imports/entry.tsx): {"getNumber"}
"use strict";
let getNumber = () => 99;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};