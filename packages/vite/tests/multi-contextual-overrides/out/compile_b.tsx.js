// /packages/vite/tests/multi-1/b.tsx (/packages/vite/tests/multi-1/entry.tsx): {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-9qr0lu");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-1/b.tsx: {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]['color'];
let exported = new String("exported-9qr0lu");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/b.tsx.css').resolve([
`.exported-9qr0lu {
${exported.css}
}`
].join('\n'));


// /packages/vite/tests/multi-1/entry.tsx: {"css", "color", "a"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-5y38xq");
a.css = `background: ${color};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.css').resolve([
`.a-5y38xq {
${a.css}
}`
].join('\n'));


// /packages/vite/tests/multi-2/b.tsx (/packages/vite/tests/multi-2/entry.tsx): {"color", "originalColor", "exported", "css"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-45274t");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/b.tsx: {"css", "exported", "originalColor", "color"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-45274t");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/b.tsx.css').resolve([
`.exported-45274t {
${exported.css}
}`
].join('\n'));


// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"exported", "color", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-iv0de3");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/c.tsx: {"css", "color", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]['color'];
let exported = new String("exported-iv0de3");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/c.tsx.css').resolve([
`.exported-iv0de3 {
${exported.css}
}`
].join('\n'));


// /packages/vite/tests/multi-2/entry.tsx: {"color", "css", "a"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-c1evwh");
a.css = `background: ${color};`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/entry.tsx.css').resolve([
`.a-c1evwh {
${a.css}
}`
].join('\n'));


// /packages/vite/tests/multi-contextual-overrides/b.tsx (/packages/vite/tests/multi-contextual-overrides/entry.tsx): {"css", "color", "inner"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("inner-v4l63w");
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};

// /packages/vite/tests/multi-contextual-overrides/b.tsx: {"color", "inner", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['color'];
let inner = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['inner'];
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color};__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-contextual-overrides/b.tsx.css').resolve([
`.inner-v4l63w {
${inner.css}
}`
].join('\n'));


// /packages/vite/tests/multi-contextual-overrides/entry.tsx: {"outer", "inner", "css"}
"use strict";
const inner = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]["inner"];
let { css } = require("/packages/core/dist/index.mjs");
let outer = new String("outer-yvgxuz");
outer.css = `.${inner} {
    background: "red";
  }`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-contextual-overrides/entry.tsx.css').resolve([
`.outer-yvgxuz {
${outer.css}
}`
].join('\n'));
