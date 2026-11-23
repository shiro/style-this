// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"a", "css", "num", "top"}
"use strict";
const top = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"]["top"];
const num = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-gxu385");
a.css = `margin: ${num}px;
  top: ${top}px;`;
return {
"a": a.css
};


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"Math", "css", "num", "shared", "top"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let __styleThis_expression_1 = {
	top: 1,
	bottom: 2
};
let { top, bottom } = __styleThis_expression_1;
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num,top};

// /packages/vite/tests/edge-cases-1/shared.tsx: {"Math", "css", "num", "shared"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};return {
"shared": shared.css
};
