"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['color'];
let inner = global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['inner'];
inner.css = `background: ${color};`;

global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_dddeefff["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/packages/vite/tests/multi-contextual-overrides/b.tsx.css', [
`.inner-v4l63w {
${inner.css}
}`
].join('\n'));