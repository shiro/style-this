"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-mnc5er");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/c.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx.css', [
`.exported-mnc5er {
${exported.css}
}`
].join('\n'));

// entry:
"use strict";
const originalColor = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-wpmbcx");
exported.css = `background: ${color};`;

global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx.css', [
`.exported-wpmbcx {
${exported.css}
}`
].join('\n'));

// entry:
"use strict";
const color = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let a = new String("a-dqjcte");
a.css = `background: ${color};`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/multi-2/entry.tsx.css', [
`.a-dqjcte {
${a.css}
}`
].join('\n'));