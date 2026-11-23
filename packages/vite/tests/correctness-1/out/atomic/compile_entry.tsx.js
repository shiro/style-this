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

// /packages/vite/tests/correctness-1/entry.tsx: {"Size", "__styleThis_12", "__styleThis_15", "__styleThis_20", "__styleThis_24", "__styleThis_4", "__styleThis_5", "__styleThis_7", "__styleThis_9", "_styleThisClasses", "a", "a1", "accent", "b", "color", "comp", "css", "mib", "mutate", "s2", "sized", "spacing", "st", "style", "theme", "themed", "undefined", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_20 = new String("__styleThis_20-rcdyrk");
__styleThis_20.css = `background: black;`;
let __styleThis_var_a2_18 = () => {
	const a3 = () => {
		return __styleThis_20;
	};
	return a3();
};
let __styleThis_var_wi_17 = __styleThis_var_a2_18();
let __styleThis_var_m_16 = new String("m-ghy34l");
__styleThis_var_m_16.css = `${__styleThis_var_wi_17}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_18;
	const wi = __styleThis_var_wi_17;
	const m = __styleThis_var_m_16;
	return wi;
};
let b = new String("b-7o5eb8");
b.css = `${a1()}`;
let __styleThis_12 = new String("__styleThis_12-stinkp");
__styleThis_12.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let __styleThis_15 = new String("__styleThis_15-no9e3s");
__styleThis_15.css = `background: blue;
    `;
let __styleThis_var_c_14 = () => __styleThis_15;
let __styleThis_var_s1_13 = new String("s1-ibwxer");
__styleThis_var_s1_13.css = `${__styleThis_var_c_14().css}
    `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_14;
		const s1 = __styleThis_var_s1_13;
	};
	mutate(b);
	return __styleThis_12;
};
let __styleThis_expression_10 = { color: "blue" };
let { color } = __styleThis_expression_10;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-zwper0");
s2.css = `${st}
  ${comp().css}`;
let __styleThis_9 = new String("__styleThis_9-abwhir");
class Size {
	static base = 2;
	static gap() {
		const gap = __styleThis_var_gap_8;
		return __styleThis_9;
	}
}
let __styleThis_var_gap_8 = Size.base * 2;
__styleThis_9.css = `gap: ${__styleThis_var_gap_8}px;`;
let __styleThis_7 = new String("__styleThis_7-9ib41m");
let spacing = {
	base: 3,
	margin() {
		const margin = __styleThis_var_margin_6;
		return __styleThis_7;
	}
};
let __styleThis_var_margin_6 = spacing.base * 2;
__styleThis_7.css = `margin: ${__styleThis_var_margin_6}px;`;
let sized = new String("sized-aj4l6b");
sized.css = `${Size.gap().css}
  ${spacing.margin().css}`;
let __styleThis_5 = new String("__styleThis_5-irk5mb");
__styleThis_5.css = `color: blue;`;
function accent() {
	return __styleThis_5;
}
let __styleThis_var_enabled_3 = true;
let __styleThis_4 = new String("__styleThis_4-gta3sx");
__styleThis_4.css = `color: red;`;
function __styleThis_var_accent_2() {
	return __styleThis_var_enabled_3 ? __styleThis_4 : undefined;
}
let __styleThis_var_link_1 = new String("link-q74xyr");
__styleThis_var_link_1.css = `${__styleThis_var_accent_2().css}`;
function theme() {
	const enabled = __styleThis_var_enabled_3;
	function accent() {
		return enabled ? __styleThis_4 : undefined;
	}
	const link = __styleThis_var_link_1;
	return accent();
}
let themed = new String("themed-3ctqjk");
themed.css = `${theme().css}
  ${accent().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
function __styleThis_var_gap_21() {
	return 4;
}
let __styleThis_24 = new String("__styleThis_24-olmb8t");
__styleThis_24.css = `gap: ${__styleThis_var_gap_21()}px;`;
return {
"__styleThis_24": __styleThis_24.css,
"__styleThis_20": __styleThis_20.css,
"__styleThis_var_m_16": __styleThis_var_m_16.css,
"b": b.css,
"__styleThis_15": __styleThis_15.css,
"__styleThis_var_s1_13": __styleThis_var_s1_13.css,
"__styleThis_12": __styleThis_12.css,
"s2": s2.css,
"__styleThis_9": __styleThis_9.css,
"__styleThis_7": __styleThis_7.css,
"sized": sized.css,
"__styleThis_5": __styleThis_5.css,
"__styleThis_4": __styleThis_4.css,
"__styleThis_var_link_1": __styleThis_var_link_1.css,
"themed": themed.css,
"unrelated": unrelated.css
};
