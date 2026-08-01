// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"__global__export__", "foo", "css", "__styleThis_expression_1", "__styleThis_expression_2"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("foo-l6j05a");
foo.css = `color: white;`;
let __styleThis_expression_2 = new String("__styleThis_expression_2-wduf4d");
__styleThis_expression_2.css = `color: hotpink;
  `;
let __styleThis_expression_1 = new String("__styleThis_expression_1-gp6rwx");
__styleThis_expression_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_expression_1;
	}
}

global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"__styleThis_expression_3", "unrelated", "style", "s2", "comp", "mib", "__styleThis_expression_11", "b", "mutate", "a", "color", "__styleThis_expression_6", "a1", "css", "st"}
"use strict";
const a = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_expression_11 = new String("__styleThis_expression_11-abwhir");
__styleThis_expression_11.css = `a`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_expression_11;
	};
	return [0];
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
let __styleThis_var_m_7 = new String("m-9ib41m");
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
};
let b = new String("b-aj4l6b");
b.css = `${a1}`;
let __styleThis_expression_6 = new String("__styleThis_expression_6-irk5mb");
__styleThis_expression_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_expression_6;
let __styleThis_var_s1_4 = new String("s1-gta3sx");
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
let __styleThis_expression_3 = new String("__styleThis_expression_3-q74xyr");
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
let s2 = new String("s2-3ctqjk");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
__styleThis_css_aabbbccc.get('/packages/vite/tests/correctness-1/entry.tsx.css').resolve([
`.__styleThis_expression_11-abwhir {
${__styleThis_expression_11.css}
}`,
`.m-9ib41m {
${__styleThis_var_m_7.css}
}`,
`.b-aj4l6b {
${b.css}
}`,
`.__styleThis_expression_6-irk5mb {
${__styleThis_expression_6.css}
}`,
`.s1-gta3sx {
${__styleThis_var_s1_4.css}
}`,
`.__styleThis_expression_3-q74xyr {
${__styleThis_expression_3.css}
}`,
`.s2-3ctqjk {
${s2.css}
}`,
`.unrelated-5y7cxe {
${unrelated.css}
}`
].join('\n'));
