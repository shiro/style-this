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

// /packages/vite/tests/correctness-1/entry.tsx: {"Size", "__styleThis_1", "__styleThis_2", "__styleThis_3", "__styleThis_4", "__styleThis_5", "__styleThis_6", "__styleThis_7", "__styleThis_8", "a", "a1", "accent", "b", "color", "comp", "css", "mib", "mutate", "s2", "sized", "spacing", "st", "style", "theme", "themed", "undefined", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_7 = new String("__styleThis_7-rcdyrk");
__styleThis_7.css = `background: black;`;
let __styleThis_var_a2_12 = () => {
	const a3 = () => {
		return __styleThis_7;
	};
	return a3();
};
let __styleThis_var_wi_11 = __styleThis_var_a2_12();
let __styleThis_var_m_10 = new String("m-ghy34l");
__styleThis_var_m_10.css = `${__styleThis_var_wi_11}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_12;
	const wi = __styleThis_var_wi_11;
	const m = __styleThis_var_m_10;
	return wi;
};
let b = new String("b-7o5eb8");
b.css = `${a1()}`;
let __styleThis_5 = new String("__styleThis_5-stinkp");
__styleThis_5.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let __styleThis_6 = new String("__styleThis_6-no9e3s");
__styleThis_6.css = `background: blue;
    `;
let __styleThis_var_c_9 = () => __styleThis_6;
let __styleThis_var_s1_8 = new String("s1-ibwxer");
__styleThis_var_s1_8.css = `${__styleThis_var_c_9().css}
    `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_9;
		const s1 = __styleThis_var_s1_8;
	};
	mutate(b);
	return __styleThis_5;
};
let __styleThis_expression_6 = { color: "blue" };
let { color } = __styleThis_expression_6;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-zwper0");
s2.css = `${st}
  ${comp().css}`;
let __styleThis_4 = new String("__styleThis_4-abwhir");
class Size {
	static base = 2;
	static gap() {
		const gap = __styleThis_var_gap_5;
		return __styleThis_4;
	}
}
let __styleThis_var_gap_5 = Size.base * 2;
__styleThis_4.css = `gap: ${__styleThis_var_gap_5}px;`;
let __styleThis_3 = new String("__styleThis_3-9ib41m");
let spacing = {
	base: 3,
	margin() {
		const margin = __styleThis_var_margin_4;
		return __styleThis_3;
	}
};
let __styleThis_var_margin_4 = spacing.base * 2;
__styleThis_3.css = `margin: ${__styleThis_var_margin_4}px;`;
let sized = new String("sized-aj4l6b");
sized.css = `${Size.gap().css}
  ${spacing.margin().css}`;
let __styleThis_2 = new String("__styleThis_2-irk5mb");
__styleThis_2.css = `color: blue;`;
function accent() {
	return __styleThis_2;
}
let __styleThis_var_enabled_3 = true;
let __styleThis_1 = new String("__styleThis_1-gta3sx");
__styleThis_1.css = `color: red;`;
function __styleThis_var_accent_2() {
	return __styleThis_var_enabled_3 ? __styleThis_1 : undefined;
}
let __styleThis_var_link_1 = new String("link-q74xyr");
__styleThis_var_link_1.css = `${__styleThis_var_accent_2().css}`;
function theme() {
	const enabled = __styleThis_var_enabled_3;
	function accent() {
		return enabled ? __styleThis_1 : undefined;
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
function __styleThis_var_gap_14() {
	return 4;
}
let __styleThis_8 = new String("__styleThis_8-olmb8t");
__styleThis_8.css = `gap: ${__styleThis_var_gap_14()}px;`;
return [
`.__styleThis_8-olmb8t {
${__styleThis_8.css}
}`,
`.__styleThis_7-rcdyrk {
${__styleThis_7.css}
}`,
`.m-ghy34l {
${__styleThis_var_m_10.css}
}`,
`.b-7o5eb8 {
${b.css}
}`,
`.__styleThis_6-no9e3s {
${__styleThis_6.css}
}`,
`.s1-ibwxer {
${__styleThis_var_s1_8.css}
}`,
`.__styleThis_5-stinkp {
${__styleThis_5.css}
}`,
`.s2-zwper0 {
${s2.css}
}`,
`.__styleThis_4-abwhir {
${__styleThis_4.css}
}`,
`.__styleThis_3-9ib41m {
${__styleThis_3.css}
}`,
`.sized-aj4l6b {
${sized.css}
}`,
`.__styleThis_2-irk5mb {
${__styleThis_2.css}
}`,
`.__styleThis_1-gta3sx {
${__styleThis_1.css}
}`,
`.link-q74xyr {
${__styleThis_var_link_1.css}
}`,
`.themed-3ctqjk {
${themed.css}
}`,
`.unrelated-5y7cxe {
${unrelated.css}
}`
].join('\n');
