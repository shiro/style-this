"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let foo = new String("foo-y7w1qz");
foo.css = `color: white;`;

global.__styleThis_dddeefff["/a.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"] ?? {}), foo};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx.css', [
`.foo-y7w1qz {
${foo.css}
}`
].join('\n'));

// entry:
"use strict";
const a = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_expression_5 = new String("__styleThis_expression_5-z0dufg");
__styleThis_expression_5.css = `background: blue;
    `;
let __styleThis_var_c_4 = () => __styleThis_expression_5;
let __styleThis_var_s1_3 = new String("s1-9qjw5y");
__styleThis_var_s1_3.css = `${__styleThis_var_c_4().css}
    `;
let __styleThis_expression_2 = new String("__styleThis_expression_2-9ejoh6");
__styleThis_expression_2.css = ``;
let comp = () => {
("foob");
	const b = undefined;
	mutate(b);
	return __styleThis_expression_2;
};
let st = `color: pink;`;
let s2 = new String("s2-w5qjc1");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-ox2zkx");
unrelated.css = `background: none;
  ${a.foo.css}`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx.css', [
`.s1-9qjw5y {
${__styleThis_var_s1_3.css}
}`,
`.__styleThis_expression_2-9ejoh6 {
${__styleThis_expression_2.css}
}`,
`.s2-w5qjc1 {
${s2.css}
}`,
`.__styleThis_expression_5-z0dufg {
${__styleThis_expression_5.css}
}`,
`.unrelated-ox2zkx {
${unrelated.css}
}`
].join('\n'));