"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-iv0de3");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-2/c.tsx.css', [
`.exported-iv0de3 {
${exported.css}
}`
].join('\n'));

// virtual program:
"use strict";
const originalColor = __styleThis_dddeefff["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-45274t");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-2/b.tsx.css', [
`.exported-45274t {
${exported.css}
}`
].join('\n'));

// virtual program:
"use strict";
const color = __styleThis_dddeefff["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-c1evwh");
a.css = `background: ${color};`;

__styleThis_aabbbccc.set('/packages/vite/tests/multi-2/entry.tsx.css', [
`.a-c1evwh {
${a.css}
}`
].join('\n'));