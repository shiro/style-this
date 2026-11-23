// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"a", "css", "getNumber"}
"use strict";
let { getNumber } = require("/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js");
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-tej8d6");
a.css = `margin: ${getNumber()};`;
return [
`.a-tej8d6 {
${a.css}
}`
].join('\n');
