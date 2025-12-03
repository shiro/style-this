"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("inner-v4l63w");
inner.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-contextual-overrides/b.tsx.css', [
`.inner-v4l63w {
${inner.css}
}`
].join('\n'));

// virtual program:
"use strict";
const inner = __styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"]["inner"];
let { css } = require("/packages/core/dist/index.mjs");
let outer = new String("outer-yvgxuz");
outer.css = `.${inner} {
    background: "red";
  }`;

__styleThis_aabbbccc.set('/packages/vite/tests/multi-contextual-overrides/entry.tsx.css', [
`.outer-yvgxuz {
${outer.css}
}`
].join('\n'));