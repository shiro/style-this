"use strict";
let getNumber = () => 99;

global.__styleThis_dddeefff["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};

// virtual program:
"use strict";
const getNumber = __styleThis_dddeefff["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-wtyj0x");
a.css = `margin: ${getNumber()};`;

__styleThis_aabbbccc.set('/packages/vite/tests/edge-cases-library-imports/entry.tsx.css', [
`.a-wtyj0x {
${a.css}
}`
].join('\n'));