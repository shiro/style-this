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

// /packages/vite/tests/correctness-1/entry.tsx: {"Size", "__styleThis_12", "__styleThis_17", "__styleThis_19", "__styleThis_2", "__styleThis_4", "__styleThis_6", "__styleThis_9", "_styleThisClasses", "a", "a1", "accent", "b", "color", "comp", "css", "mib", "mutate", "s2", "sized", "spacing", "st", "style", "theme", "themed", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_17 = new String("__styleThis_17-ghy34l");
__styleThis_17.css = `background: black;`;
let __styleThis_var_a2_15 = () => {
	const a3 = () => {
		return __styleThis_17;
	};
	return a3();
};
let __styleThis_var_wi_14 = __styleThis_var_a2_15();
let __styleThis_var_m_13 = new String("m-7o5eb8");
__styleThis_var_m_13.css = `${__styleThis_var_wi_14}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_15;
	const wi = __styleThis_var_wi_14;
	const m = __styleThis_var_m_13;
	return wi;
};
let b = new String("b-no9e3s");
b.css = `${a1()}`;
let __styleThis_9 = new String("__styleThis_9-zwper0");
__styleThis_9.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let __styleThis_12 = new String("__styleThis_12-ibwxer");
__styleThis_12.css = `background: blue;
    `;
let __styleThis_var_c_11 = () => __styleThis_12;
let __styleThis_var_s1_10 = new String("s1-stinkp");
__styleThis_var_s1_10.css = `${__styleThis_var_c_11().css}
    `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_11;
		const s1 = __styleThis_var_s1_10;
	};
	mutate(b);
	return __styleThis_9;
};
let __styleThis_expression_7 = { color: "blue" };
let { color } = __styleThis_expression_7;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-abwhir");
s2.css = `${st}
  ${comp().css}`;
let __styleThis_6 = new String("__styleThis_6-9ib41m");
class Size {
	static base = 2;
	static gap() {
		const gap = __styleThis_var_gap_5;
		return __styleThis_6;
	}
}
let __styleThis_var_gap_5 = Size.base * 2;
__styleThis_6.css = `gap: ${__styleThis_var_gap_5}px;`;
let __styleThis_4 = new String("__styleThis_4-aj4l6b");
let spacing = {
	base: 3,
	margin() {
		const margin = __styleThis_var_margin_3;
		return __styleThis_4;
	}
};
let __styleThis_var_margin_3 = spacing.base * 2;
__styleThis_4.css = `margin: ${__styleThis_var_margin_3}px;`;
let sized = new String("sized-irk5mb");
sized.css = `${Size.gap().css}
  ${spacing.margin().css}`;
let __styleThis_2 = new String("__styleThis_2-gta3sx");
__styleThis_2.css = `color: red;`;
function accent() {
	return __styleThis_2;
}
let __styleThis_var_link_1 = new String("link-q74xyr");
__styleThis_var_link_1.css = `${accent().css}`;
function theme() {
	function accent() {
		return __styleThis_2;
	}
	const link = __styleThis_var_link_1;
	return accent();
}
let themed = new String("themed-3ctqjk");
themed.css = `${theme().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
function gap() {
	return 4;
}
let __styleThis_19 = new String("__styleThis_19-rcdyrk");
__styleThis_19.css = `gap: ${gap()}px;`;
return {
"__styleThis_19": __styleThis_19.css,
"__styleThis_17": __styleThis_17.css,
"__styleThis_var_m_13": __styleThis_var_m_13.css,
"b": b.css,
"__styleThis_12": __styleThis_12.css,
"__styleThis_var_s1_10": __styleThis_var_s1_10.css,
"__styleThis_9": __styleThis_9.css,
"s2": s2.css,
"__styleThis_6": __styleThis_6.css,
"__styleThis_4": __styleThis_4.css,
"sized": sized.css,
"__styleThis_2": __styleThis_2.css,
"__styleThis_var_link_1": __styleThis_var_link_1.css,
"themed": themed.css,
"unrelated": unrelated.css
};
