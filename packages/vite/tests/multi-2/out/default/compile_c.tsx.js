// /packages/vite/tests/multi-2/b.tsx (/packages/vite/tests/multi-2/entry.tsx): {"color", "css", "exported", "originalColor"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/b.tsx: {"color", "css", "exported", "originalColor"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-ev01qj',start:149,end:179}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/b.tsx.css').resolve([
`.exported-ev01qj {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/b.tsx.css');


// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/c.tsx: {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]['color'];
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-4lyf89',start:88,end:118}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/c.tsx.css').resolve([
`.exported-4lyf89 {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/c.tsx.css');


// /packages/vite/tests/multi-2/entry.tsx: {"a", "color", "css"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-k1mv0l");
a.css = `background: ${color};`;
const cssSourcemapData = [{className:'a-k1mv0l',start:80,end:110}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/entry.tsx.css').resolve([
`.a-k1mv0l {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/entry.tsx.css');
