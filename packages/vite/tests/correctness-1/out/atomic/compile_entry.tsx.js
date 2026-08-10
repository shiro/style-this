// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"__global__export__", "__styleThis_1", "__styleThis_2", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("");
foo.css = `color: white;`;
let __styleThis_2 = new String("");
__styleThis_2.css = `color: hotpink;
  `;
let __styleThis_1 = new String("");
__styleThis_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_1;
	}
}

global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"__styleThis_11", "__styleThis_3", "__styleThis_6", "_styleThisClasses", "a", "a1", "b", "color", "comp", "css", "mib", "mutate", "s2", "st", "style", "unrelated"}
"use strict";
const a = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_11 = new String("");
__styleThis_11.css = `background: black;`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_11;
	};
	return a3();
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
let __styleThis_var_m_7 = new String("");
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
	return wi;
};
let b = new String("");
b.css = `${a1()}`;
let __styleThis_6 = new String("");
__styleThis_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_6;
let __styleThis_var_s1_4 = new String("");
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
let __styleThis_3 = new String("");
__styleThis_3.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_5;
		const s1 = __styleThis_var_s1_4;
	};
	mutate(b);
	return __styleThis_3;
};
let __styleThis_expression_1 = { color: "blue" };
let { color } = __styleThis_expression_1;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("");
unrelated.css = `background: none;
  ${a.foo.css}`;
return {
"__styleThis_11": __styleThis_11.css,
"__styleThis_var_m_7": __styleThis_var_m_7.css,
"b": b.css,
"__styleThis_6": __styleThis_6.css,
"__styleThis_var_s1_4": __styleThis_var_s1_4.css,
"__styleThis_3": __styleThis_3.css,
"s2": s2.css,
"unrelated": unrelated.css
};
