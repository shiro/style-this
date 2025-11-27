"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let foo = new String("foo-qrrsss");
foo.css = `color: white;`;

global.__styleThis_dddeefff["/a.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"] ?? {}), foo};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx.css', [
`.foo-qrrsss {
${foo.css}
}`
].join('\n'));

// entry:
"use strict";
const foo = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"]["foo"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let mutate = (v) => v;
let var_172_206 = new String("var_172_206-opppqq");
var_172_206.css = `background: blue;
    `;
let __styleThis_var_c_7 = () => var_172_206;
let __styleThis_var_s1_6 = new String("s1-mmnnoo");
__styleThis_var_s1_6.css = `${__styleThis_var_c_7().css}
    `;
let var_282_287 = new String("var_282_287-kklllm");
var_282_287.css = ``;
let a = () => {
("foob");
	const b = undefined;
	mutate(b);
	return var_282_287;
};
let st = `color: pink;`;
let s2 = new String("s2-iijjjk");
s2.css = `${st}
  ${a().css}`;
let unrelated = new String("unrelated-ggghhh");
unrelated.css = `background: none;
  ${foo.css}`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx.css', [
`.s2-iijjjk {
${s2.css}
}`,
`.var_282_287-kklllm {
${var_282_287.css}
}`,
`.unrelated-ggghhh {
${unrelated.css}
}`,
`.var_172_206-opppqq {
${var_172_206.css}
}`,
`.s1-mmnnoo {
${__styleThis_var_s1_6.css}
}`
].join('\n'));