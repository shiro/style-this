// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"__global__export__", "__styleThis_1", "__styleThis_2", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("foo-l6j05a");
foo.css = `color: white;`;
let __styleThis_1 = new String("__styleThis_1-gp6rwx");
__styleThis_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_1;
	}
}
let __styleThis_2 = new String("__styleThis_2-wduf4d");
__styleThis_2.css = `color: hotpink;
  `;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"Size", "__styleThis_10", "__styleThis_15", "__styleThis_17", "__styleThis_2", "__styleThis_4", "__styleThis_7", "_styleThisClasses", "a", "a1", "b", "color", "comp", "css", "mib", "mutate", "s2", "sized", "spacing", "st", "style", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_15 = new String("__styleThis_15-ibwxer");
__styleThis_15.css = `background: black;`;
let __styleThis_var_a2_13 = () => {
	const a3 = () => {
		return __styleThis_15;
	};
	return a3();
};
let __styleThis_var_wi_12 = __styleThis_var_a2_13();
let __styleThis_var_m_11 = new String("m-stinkp");
__styleThis_var_m_11.css = `${__styleThis_var_wi_12}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_13;
	const wi = __styleThis_var_wi_12;
	const m = __styleThis_var_m_11;
	return wi;
};
let b = new String("b-zwper0");
b.css = `${a1()}`;
let __styleThis_7 = new String("__styleThis_7-aj4l6b");
__styleThis_7.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let __styleThis_10 = new String("__styleThis_10-abwhir");
__styleThis_10.css = `background: blue;
    `;
let __styleThis_var_c_9 = () => __styleThis_10;
let __styleThis_var_s1_8 = new String("s1-9ib41m");
__styleThis_var_s1_8.css = `${__styleThis_var_c_9().css}
    `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_9;
		const s1 = __styleThis_var_s1_8;
	};
	mutate(b);
	return __styleThis_7;
};
let __styleThis_expression_5 = { color: "blue" };
let { color } = __styleThis_expression_5;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-irk5mb");
s2.css = `${st}
  ${comp().css}`;
let __styleThis_4 = new String("__styleThis_4-gta3sx");
class Size {
	static base = 2;
	static gap() {
		const gap = __styleThis_var_gap_3;
		return __styleThis_4;
	}
}
let __styleThis_var_gap_3 = Size.base * 2;
__styleThis_4.css = `gap: ${__styleThis_var_gap_3}px;`;
let __styleThis_2 = new String("__styleThis_2-q74xyr");
let spacing = {
	base: 3,
	margin() {
		const margin = __styleThis_var_margin_1;
		return __styleThis_2;
	}
};
let __styleThis_var_margin_1 = spacing.base * 2;
__styleThis_2.css = `margin: ${__styleThis_var_margin_1}px;`;
let sized = new String("sized-3ctqjk");
sized.css = `${Size.gap().css}
  ${spacing.margin().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
function gap() {
	return 4;
}
let __styleThis_17 = new String("__styleThis_17-no9e3s");
__styleThis_17.css = `gap: ${gap()}px;`;
return {
"__styleThis_17": __styleThis_17.css,
"__styleThis_15": __styleThis_15.css,
"__styleThis_var_m_11": __styleThis_var_m_11.css,
"b": b.css,
"__styleThis_10": __styleThis_10.css,
"__styleThis_var_s1_8": __styleThis_var_s1_8.css,
"__styleThis_7": __styleThis_7.css,
"s2": s2.css,
"__styleThis_4": __styleThis_4.css,
"__styleThis_2": __styleThis_2.css,
"sized": sized.css,
"unrelated": unrelated.css
};
