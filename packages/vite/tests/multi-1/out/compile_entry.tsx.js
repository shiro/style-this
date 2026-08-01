// /packages/vite/tests/multi-1/b.tsx (/packages/vite/tests/multi-1/entry.tsx): {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-w5y7wh");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-1/entry.tsx: {"css", "color", "a"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-8pm3ch");
a.css = `background: ${color};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.css').resolve([
`.a-8pm3ch {
${a.css}
}`
].join('\n'));
