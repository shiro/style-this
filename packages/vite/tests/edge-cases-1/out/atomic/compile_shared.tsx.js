// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"a", "css", "num"}
"use strict";
const num = __styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("");
a.css = `margin: ${num}px;`;
return {
"a": a.css
};


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"Math", "css", "num", "shared"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("");
shared.css = `margin: ${num}px;`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};

// /packages/vite/tests/edge-cases-1/shared.tsx: {"Math", "css", "num", "shared"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
let shared = new String("");
shared.css = `margin: ${num}px;`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};return {
"shared": shared.css
};
