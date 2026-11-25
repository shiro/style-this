// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"M", "__global__export__", "__styleThis_1", "__styleThis_2", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("foo-l6j05a");
foo.css = `color: white;`;
let __styleThis_1 = new String("__styleThis_1-gp6rwx");
__styleThis_1.css = `color: green;
    `;
class M {
	static foo() {
		return __styleThis_1;
	}
}
let __global__export__ = M;
let __styleThis_2 = new String("__styleThis_2-wduf4d");
__styleThis_2.css = `color: hotpink;
  `;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"Size", "__styleThis_1", "__styleThis_10", "__styleThis_11", "__styleThis_12", "__styleThis_13", "__styleThis_14", "__styleThis_15", "__styleThis_16", "__styleThis_2", "__styleThis_3", "__styleThis_4", "__styleThis_5", "__styleThis_6", "__styleThis_7", "__styleThis_8", "__styleThis_9", "a", "a1", "accent", "b", "card", "carded", "color", "comp", "css", "gapped", "margined", "mib", "mutate", "redeclared", "s2", "sized", "spaced", "spacedOut", "spacing", "st", "style", "theme", "themed", "undefined", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
var __styleThis_var_gap_30 = 2;
let __styleThis_16 = new String("__styleThis_16-7s1mr4");
__styleThis_16.css = `padding: ${__styleThis_var_gap_30}px;`;
function spaced() {
	if (true) {
		var gap = __styleThis_var_gap_30;
	}
	return __styleThis_16;
}
let __styleThis_15 = new String("__styleThis_15-sdiv41");
var __styleThis_var_gap_28 = 4;
__styleThis_15.css = `margin: ${__styleThis_var_gap_28}px;`;
function margined() {
	const margin = () => __styleThis_15;
	if (true) {
		var gap = __styleThis_var_gap_28;
	}
	return margin();
}
let __styleThis_var_gap_26 = 3;
let __styleThis_14 = new String("__styleThis_14-xq3wdq");
__styleThis_14.css = `margin: ${__styleThis_var_gap_26}px;`;
let __styleThis_var_margin_27 = () => __styleThis_14;
let __styleThis_13 = new String("__styleThis_13-o5mnsl");
__styleThis_13.css = `${__styleThis_var_margin_27().css} gap: ${__styleThis_var_gap_26}px;`;
function gapped() {
	const margin = __styleThis_var_margin_27;
	const gap = __styleThis_var_gap_26;
	return __styleThis_13;
}
var __styleThis_var_gap_25 = 5;
var __styleThis_var_gap_25 = 6;
let __styleThis_12 = new String("__styleThis_12-qnolav");
__styleThis_12.css = `row-gap: ${__styleThis_var_gap_25}px;`;
function redeclared() {
	var gap = __styleThis_var_gap_25;
	if (true) {
		var gap = __styleThis_var_gap_25;
	}
	return __styleThis_12;
}
let spacedOut = new String("spacedOut-o96r4h");
spacedOut.css = `${spaced().css}
  ${margined().css}
  ${gapped().css}
  ${redeclared().css}`;
let mutate = (v) => v;
let __styleThis_8 = new String("__styleThis_8-1i78lu");
__styleThis_8.css = `background: black;`;
let __styleThis_var_a2_12 = () => {
	const a3 = () => {
		return __styleThis_8;
	};
	return a3();
};
let __styleThis_var_wi_11 = __styleThis_var_a2_12();
let __styleThis_var_m_10 = new String("m-olmb8t");
__styleThis_var_m_10.css = `${__styleThis_var_wi_11}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_12;
	const wi = __styleThis_var_wi_11;
	const m = __styleThis_var_m_10;
	return wi;
};
let b = new String("b-rcdyrk");
b.css = `${a1()}`;
let __styleThis_6 = new String("__styleThis_6-no9e3s");
__styleThis_6.css = `@media (max-width: 500px) {
      background: blue;
    }
  `;
let __styleThis_7 = new String("__styleThis_7-ghy34l");
__styleThis_7.css = `background: blue;
    `;
let __styleThis_var_c_9 = () => __styleThis_7;
let __styleThis_var_s1_8 = new String("s1-7o5eb8");
__styleThis_var_s1_8.css = `${__styleThis_var_c_9().css}
    `;
let comp = () => {
("foob");
	const b = () => {
		const c = __styleThis_var_c_9;
		const s1 = __styleThis_var_s1_8;
	};
	mutate(b);
	return __styleThis_6;
};
let __styleThis_expression_6 = { color: "blue" };
let { color } = __styleThis_expression_6;
let st = `color: ${color};
  ${mib.foo().css}`;
let s2 = new String("s2-ibwxer");
s2.css = `${st}
  ${comp().css}`;
let __styleThis_5 = new String("__styleThis_5-stinkp");
class Size {
	static base = 2;
	static gap() {
		const gap = __styleThis_var_gap_5;
		return __styleThis_5;
	}
}
let __styleThis_var_gap_5 = Size.base * 2;
__styleThis_5.css = `gap: ${__styleThis_var_gap_5}px;`;
let __styleThis_4 = new String("__styleThis_4-zwper0");
let spacing = {
	base: 3,
	margin() {
		const margin = __styleThis_var_margin_4;
		return __styleThis_4;
	}
};
let __styleThis_var_margin_4 = spacing.base * 2;
__styleThis_4.css = `margin: ${__styleThis_var_margin_4}px;`;
let sized = new String("sized-abwhir");
sized.css = `${Size.gap().css}
  ${spacing.margin().css}`;
let __styleThis_3 = new String("__styleThis_3-9ib41m");
__styleThis_3.css = `color: blue;`;
function accent() {
	return __styleThis_3;
}
let __styleThis_var_enabled_3 = true;
let __styleThis_2 = new String("__styleThis_2-aj4l6b");
__styleThis_2.css = `color: red;`;
function __styleThis_var_accent_2() {
	return __styleThis_var_enabled_3 ? __styleThis_2 : undefined;
}
let __styleThis_var_link_1 = new String("link-irk5mb");
__styleThis_var_link_1.css = `${__styleThis_var_accent_2().css}`;
function theme() {
	const enabled = __styleThis_var_enabled_3;
	function accent() {
		return enabled ? __styleThis_2 : undefined;
	}
	const link = __styleThis_var_link_1;
	return accent();
}
let themed = new String("themed-gta3sx");
themed.css = `${theme().css}
  ${accent().css}`;
let __styleThis_1 = new String("__styleThis_1-q74xyr");
__styleThis_1.css = `padding: 2px;`;
function card({ padding = __styleThis_1 } = {}) {
	return padding;
}
let carded = new String("carded-3ctqjk");
carded.css = `${card().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
function __styleThis_var_gap_14() {
	return 4;
}
let __styleThis_9 = new String("__styleThis_9-9ubgdi");
__styleThis_9.css = `gap: ${__styleThis_var_gap_14()}px;`;
let __styleThis_var_countdown_18 = function count(n) {
	return n > 1 ? count(n - 1) : n;
};
let __styleThis_var_Doubled_17 = class Count {
	static size = 2;
	static double() {
		return Count.size * 2;
	}
};
let __styleThis_10 = new String("__styleThis_10-a381mv");
__styleThis_10.css = `margin: ${__styleThis_var_countdown_18(3)}px ${__styleThis_var_Doubled_17.double()}px;`;
let __styleThis_var_size_21 = 4;
let __styleThis_var_double_22 = () => __styleThis_var_size_21 * 2;
let __styleThis_var_unit_20 = (() => {
	class Unit {
		static px = "px";
	}
	try {
		throw Unit.px;
	} catch (error) {
		return error;
	}
})();
let __styleThis_11 = new String("__styleThis_11-zkhm3g");
__styleThis_11.css = `margin: ${__styleThis_var_double_22()}${__styleThis_var_unit_20};`;
return {
"__styleThis_16": __styleThis_16.css,
"__styleThis_15": __styleThis_15.css,
"__styleThis_14": __styleThis_14.css,
"__styleThis_13": __styleThis_13.css,
"__styleThis_12": __styleThis_12.css,
"spacedOut": spacedOut.css,
"__styleThis_11": __styleThis_11.css,
"__styleThis_10": __styleThis_10.css,
"__styleThis_9": __styleThis_9.css,
"__styleThis_8": __styleThis_8.css,
"__styleThis_var_m_10": __styleThis_var_m_10.css,
"b": b.css,
"__styleThis_7": __styleThis_7.css,
"__styleThis_var_s1_8": __styleThis_var_s1_8.css,
"__styleThis_6": __styleThis_6.css,
"s2": s2.css,
"__styleThis_5": __styleThis_5.css,
"__styleThis_4": __styleThis_4.css,
"sized": sized.css,
"__styleThis_3": __styleThis_3.css,
"__styleThis_2": __styleThis_2.css,
"__styleThis_var_link_1": __styleThis_var_link_1.css,
"themed": themed.css,
"__styleThis_1": __styleThis_1.css,
"carded": carded.css,
"unrelated": unrelated.css
};
