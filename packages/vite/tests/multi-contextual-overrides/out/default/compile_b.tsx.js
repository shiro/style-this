// /packages/vite/tests/multi-contextual-overrides/b.tsx (/packages/vite/tests/multi-contextual-overrides/entry.tsx): {"color", "css", "inner"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("inner-wxav4x");
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};

// /packages/vite/tests/multi-contextual-overrides/b.tsx: {"color", "css", "inner"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['color'];
let inner = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['inner'];
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color};const cssSourcemapData = [{className:'inner-wxav4x',start:92,end:122}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-contextual-overrides/b.tsx.css').resolve([
`.inner-wxav4x {
${inner.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-contextual-overrides/b.tsx.css');


// /packages/vite/tests/multi-contextual-overrides/entry.tsx: {"css", "inner", "outer"}
"use strict";
const inner = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]["inner"];
let { css } = require("/packages/core/dist/index.mjs");
let outer = new String("outer-folqvg");
outer.css = `.${inner} {
    background: "red";
  }`;
const cssSourcemapData = [{className:'outer-folqvg',start:84,end:131}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-contextual-overrides/entry.tsx.css').resolve([
`.outer-folqvg {
${outer.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-contextual-overrides/entry.tsx.css');
