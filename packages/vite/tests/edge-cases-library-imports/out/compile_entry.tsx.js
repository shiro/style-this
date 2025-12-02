"use strict";
let getNumber = () => 99;

global.__styleThis_dddeefff["/node_modules/some_lib/index.js"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};

// entry:
"use strict";
const getNumber = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let a = new String("a-gtavgx");
a.css = `margin: ${getNumber()};`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/edge-cases-library-imports/entry.tsx.css', [
`.a-gtavgx {
${a.css}
}`
].join('\n'));