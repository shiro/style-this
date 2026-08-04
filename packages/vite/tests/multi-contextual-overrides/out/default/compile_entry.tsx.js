// /packages/vite/tests/multi-1/b.tsx (/packages/vite/tests/multi-1/entry.tsx): {"color", "exported", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-w5y7wh");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-1/b.tsx: {"css", "color", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]['color'];
let exported = new String("exported-w5y7wh");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-w5y7wh',start:87,end:117}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/b.tsx.css').resolve([
`.exported-w5y7wh {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-1/b.tsx.css');


// /packages/vite/tests/multi-1/entry.tsx: {"css", "color", "a"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-8pm3ch");
a.css = `background: ${color};`;
const cssSourcemapData = [{className:'a-8pm3ch',start:80,end:110}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.css').resolve([
`.a-8pm3ch {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-1/entry.tsx.css');


// /packages/vite/tests/multi-2/b.tsx (/packages/vite/tests/multi-2/entry.tsx): {"css", "exported", "color", "originalColor"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/b.tsx: {"css", "originalColor", "exported", "color"}
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


// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"color", "exported", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/c.tsx: {"css", "color", "exported"}
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


// /packages/vite/tests/multi-2/entry.tsx: {"css", "color", "a"}
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


// /packages/vite/tests/multi-contextual-overrides/b.tsx (/packages/vite/tests/multi-contextual-overrides/entry.tsx): {"inner", "css", "color"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("inner-wxav4x");
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};

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
