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

global.__styleThis_dddeefff["/a.tsx"] = {...(global.__styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};
__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx.css', [
`.__styleThis_expression_2-xqzcdq {
${__styleThis_expression_2.css}
}`,
`.__styleThis_expression_1-y7w1qz {
${__styleThis_expression_1.css}
}`,
`.foo-uvg9av {
${foo.css}
}`
].join('\n'));

// entry:
"use strict";
const a = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_dddeefff["/home/shiro/project/style-this/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_expression_9 = new String("__styleThis_expression_9-cdunkh");
__styleThis_expression_9.css = `a`;
let __styleThis_var_a2_7 = () => {
	const a3 = () => {
		return __styleThis_expression_9;
	};
};
let __styleThis_var_m_6 = new String("m-xqb8pe");
__styleThis_var_m_6.css = `${__styleThis_var_a2_7}
  `;
let a1 = () => {
	const a2 = () => {
		const a3 = () => {
			return __styleThis_expression_9;
		};
	};
	const m = __styleThis_var_m_6;
};
let b = new String("b-huzk9u");
b.css = `${a1}`;
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
	const b = () => {
		const c = () => __styleThis_expression_5;
		const s1 = __styleThis_var_s1_3;
	};
	mutate(b);
	return __styleThis_expression_2;
};
let { color } = { color: "blue" };
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-w5qjc1");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-ox2zkx");
unrelated.css = `background: none;
  ${a.foo.css}`;

__styleThis_aabbbccc.set('/home/shiro/project/style-this/packages/vite/tests/correctness-1/entry.tsx.css', [
`.m-xqb8pe {
${__styleThis_var_m_6.css}
}`,
`.__styleThis_expression_2-9ejoh6 {
${__styleThis_expression_2.css}
}`,
`.__styleThis_expression_5-z0dufg {
${__styleThis_expression_5.css}
}`,
`.__styleThis_expression_9-cdunkh {
${__styleThis_expression_9.css}
}`,
`.b-huzk9u {
${b.css}
}`,
`.unrelated-ox2zkx {
${unrelated.css}
}`,
`.s1-9qjw5y {
${__styleThis_var_s1_3.css}
}`,
`.s2-w5qjc1 {
${s2.css}
}`
].join('\n'));