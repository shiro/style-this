// /packages/vite/tests/multi-contextual-overrides/b.tsx (/packages/vite/tests/multi-contextual-overrides/entry.tsx): {"color", "css", "inner"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("");
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};

// /packages/vite/tests/multi-contextual-overrides/b.tsx: {"color", "css", "inner"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['color'];
let inner = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]['inner'];
inner.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color};return {
"inner": inner.css
};


// /packages/vite/tests/multi-contextual-overrides/entry.tsx: {"css", "inner", "outer"}
"use strict";
const inner = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-contextual-overrides/b.tsx"]["inner"];
let { css } = require("/packages/core/dist/index.mjs");
let outer = new String("");
outer.css = `.${inner} {
    background: "red";
  }`;
return {
"outer": outer.css
};
