"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let foo = new String("foo-uvg9av");
foo.css = `color: white;`;
let __styleThis_expression_2 = new String("__styleThis_expression_2-xqzcdq");
__styleThis_expression_2.css = `color: hotpink;
  `;
let __styleThis_expression_1 = new String("__styleThis_expression_1-y7w1qz");
__styleThis_expression_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_expression_1;
	}
}

global.__styleThis_dddeefff["/a.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"] ?? {}), foo,__global__export__};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx.css', [
`.foo-uvg9av {
${foo.css}
}`,
`.__styleThis_expression_2-xqzcdq {
${__styleThis_expression_2.css}
}`,
`.__styleThis_expression_1-y7w1qz {
${__styleThis_expression_1.css}
}`
].join('\n'));

// entry:
"use strict";
const a = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_expression_11 = new String("__styleThis_expression_11-cdunkh");
__styleThis_expression_11.css = `a`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_expression_11;
	};
	return [0];
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
let __styleThis_var_m_7 = new String("m-xqb8pe");
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
};
let b = new String("b-huzk9u");
b.css = `${a1}`;
let __styleThis_expression_6 = new String("__styleThis_expression_6-z0dufg");
__styleThis_expression_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_expression_6;
let __styleThis_var_s1_4 = new String("s1-9qjw5y");
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
let __styleThis_expression_3 = new String("__styleThis_expression_3-9ejoh6");
__styleThis_expression_3.css = ``;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_5;
		const s1 = __styleThis_var_s1_4;
	};
	mutate(b);
	return __styleThis_expression_3;
};
let __styleThis_expression_1 = { color: "blue" };
let { color } = __styleThis_expression_1;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-w5qjc1");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-ox2zkx");
unrelated.css = `background: none;
  ${a.foo.css}`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx.css', [
`.__styleThis_expression_6-z0dufg {
${__styleThis_expression_6.css}
}`,
`.b-huzk9u {
${b.css}
}`,
`.m-xqb8pe {
${__styleThis_var_m_7.css}
}`,
`.__styleThis_expression_3-9ejoh6 {
${__styleThis_expression_3.css}
}`,
`.__styleThis_expression_11-cdunkh {
${__styleThis_expression_11.css}
}`,
`.unrelated-ox2zkx {
${unrelated.css}
}`,
`.s2-w5qjc1 {
${s2.css}
}`,
`.s1-9qjw5y {
${__styleThis_var_s1_4.css}
}`
].join('\n'));