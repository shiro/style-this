// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"a", "css", "getNumber"}
"use strict";
const getNumber = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("");
a.css = `margin: ${getNumber()};`;
return {
"a": a.css
};


// /packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js (/packages/vite/tests/edge-cases-library-imports/entry.tsx): {"getNumber"}
"use strict";
let getNumber = () => 99;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};