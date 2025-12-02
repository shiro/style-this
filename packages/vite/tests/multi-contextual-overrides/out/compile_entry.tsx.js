"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = "blue";
let inner = new String("inner-6z8pej");
inner.css = `background: ${color};`;

global.__styleThis_dddeefff["/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"] ?? {}), color,inner};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx.css', [
`.inner-6z8pej {
${inner.css}
}`
].join('\n'));

// entry:
"use strict";
const inner = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/b.tsx"]["inner"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let outer = new String("outer-dyzwx6");
outer.css = `.${inner} {
    background: "red";
  }`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-contextual-overrides/entry.tsx.css', [
`.outer-dyzwx6 {
${outer.css}
}`
].join('\n'));