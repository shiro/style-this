// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"foo", "css", "__styleThis_expression_2", "__global__export__", "__styleThis_expression_1"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("foo-4hazsh");
foo.css = `color: white;`;
let __styleThis_expression_2 = new String("__styleThis_expression_2-s5qr4d");
__styleThis_expression_2.css = `color: hotpink;
  `;
let __styleThis_expression_1 = new String("__styleThis_expression_1-hezg16");
__styleThis_expression_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_expression_1;
	}
}

global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"a1", "color", "st", "mib", "mutate", "unrelated", "__styleThis_expression_11", "__styleThis_expression_6", "_styleThisClasses", "s2", "css", "__styleThis_expression_3", "b", "style", "a", "comp"}
const __styleThis_expression_11 = new String('__styleThis_expression_11-g5yzc1');
const __styleThis_var_m_7 = new String('m-t2jk5y');
const b = new String('b-0hyvwp');
const __styleThis_expression_6 = new String('__styleThis_expression_6-t2j4xy');
const __styleThis_var_s1_4 = new String('s1-9ebsxi');
const __styleThis_expression_3 = new String('__styleThis_expression_3-xirstq');
const s2 = new String('s2-f0l6r0');
const unrelated = new String('unrelated-h6bsx2');
"use strict";
const a = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
const _styleThisClasses = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/entry.tsx.style-this.js"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
__styleThis_expression_11.css = `a`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_expression_11;
	};
	return [0];
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
};
b.css = `${a1}`;
__styleThis_expression_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_expression_6;
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
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
s2.css = `${st}
  ${comp().css}`;
unrelated.css = `background: none;
  ${a.foo.css}`;
// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!__styleThis_expression_11.css) { console.error('[atomic] __styleThis_expression_11.css is undefined'); __styleThis_expression_11.css = ''; }
const ___styleThis_expression_11_atomic = cssToAtomicClassList(__styleThis_expression_11.css);
if (!__styleThis_var_m_7.css) { console.error('[atomic] __styleThis_var_m_7.css is undefined'); __styleThis_var_m_7.css = ''; }
const ___styleThis_var_m_7_atomic = cssToAtomicClassList(__styleThis_var_m_7.css);
if (!b.css) { console.error('[atomic] b.css is undefined'); b.css = ''; }
const _b_atomic = cssToAtomicClassList(b.css);
if (!__styleThis_expression_6.css) { console.error('[atomic] __styleThis_expression_6.css is undefined'); __styleThis_expression_6.css = ''; }
const ___styleThis_expression_6_atomic = cssToAtomicClassList(__styleThis_expression_6.css);
if (!__styleThis_var_s1_4.css) { console.error('[atomic] __styleThis_var_s1_4.css is undefined'); __styleThis_var_s1_4.css = ''; }
const ___styleThis_var_s1_4_atomic = cssToAtomicClassList(__styleThis_var_s1_4.css);
if (!__styleThis_expression_3.css) { console.error('[atomic] __styleThis_expression_3.css is undefined'); __styleThis_expression_3.css = ''; }
const ___styleThis_expression_3_atomic = cssToAtomicClassList(__styleThis_expression_3.css);
if (!s2.css) { console.error('[atomic] s2.css is undefined'); s2.css = ''; }
const _s2_atomic = cssToAtomicClassList(s2.css);
if (!unrelated.css) { console.error('[atomic] unrelated.css is undefined'); unrelated.css = ''; }
const _unrelated_atomic = cssToAtomicClassList(unrelated.css);

const cssSourcemapData = [{className:'__styleThis_expression_11-g5yzc1',start:181,end:187},{className:'m-t2jk5y',start:248,end:266},{className:'b-0hyvwp',start:282,end:296},{className:'__styleThis_expression_6-t2j4xy',start:373,end:407},{className:'s1-9ebsxi',start:425,end:452},{className:'__styleThis_expression_3-xirstq',start:483,end:488},{className:'s2-f0l6r0',start:603,end:633},{className:'unrelated-h6bsx2',start:654,end:695}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.__styleThis_expression_11-g5yzc1 {\n${extractNonAtomicCss(__styleThis_expression_11.css)||'/* atomized */'}\n}`,
`.m-t2jk5y {\n${extractNonAtomicCss(__styleThis_var_m_7.css)||'/* atomized */'}\n}`,
`.b-0hyvwp {\n${extractNonAtomicCss(b.css)||'/* atomized */'}\n}`,
`.__styleThis_expression_6-t2j4xy {\n${extractNonAtomicCss(__styleThis_expression_6.css)||'/* atomized */'}\n}`,
`.s1-9ebsxi {\n${extractNonAtomicCss(__styleThis_var_s1_4.css)||'/* atomized */'}\n}`,
`.__styleThis_expression_3-xirstq {\n${extractNonAtomicCss(__styleThis_expression_3.css)||'/* atomized */'}\n}`,
`.s2-f0l6r0 {\n${extractNonAtomicCss(s2.css)||'/* atomized */'}\n}`,
`.unrelated-h6bsx2 {\n${extractNonAtomicCss(unrelated.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/correctness-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/correctness-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_expression_11 = "' + '__styleThis_expression_11-g5yzc1' + ' ' + ___styleThis_expression_11_atomic + '";' + '\n' + 'export const _styleThis_var_m_7 = "' + 'm-t2jk5y' + ' ' + ___styleThis_var_m_7_atomic + '";' + '\n' + 'export const _styleThis_b = "' + 'b-0hyvwp' + ' ' + _b_atomic + '";' + '\n' + 'export const _styleThis_expression_6 = "' + '__styleThis_expression_6-t2j4xy' + ' ' + ___styleThis_expression_6_atomic + '";' + '\n' + 'export const _styleThis_var_s1_4 = "' + 's1-9ebsxi' + ' ' + ___styleThis_var_s1_4_atomic + '";' + '\n' + 'export const _styleThis_expression_3 = "' + '__styleThis_expression_3-xirstq' + ' ' + ___styleThis_expression_3_atomic + '";' + '\n' + 'export const _styleThis_s2 = "' + 's2-f0l6r0' + ' ' + _s2_atomic + '";' + '\n' + 'export const _styleThis_unrelated = "' + 'unrelated-h6bsx2' + ' ' + _unrelated_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/correctness-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/correctness-1/entry.tsx: {"mutate", "style", "mib", "b", "unrelated", "__styleThis_expression_6", "a", "color", "comp", "__styleThis_expression_11", "s2", "css", "a1", "__styleThis_expression_3", "st"}
"use strict";
const a = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_vars_aabbbccc["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_expression_11 = new String("__styleThis_expression_11-g5yzc1");
__styleThis_expression_11.css = `a`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_expression_11;
	};
	return [0];
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
let __styleThis_var_m_7 = new String("m-t2jk5y");
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
};
let b = new String("b-0hyvwp");
b.css = `${a1}`;
let __styleThis_expression_6 = new String("__styleThis_expression_6-t2j4xy");
__styleThis_expression_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_expression_6;
let __styleThis_var_s1_4 = new String("s1-9ebsxi");
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
let __styleThis_expression_3 = new String("__styleThis_expression_3-xirstq");
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
let s2 = new String("s2-f0l6r0");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-h6bsx2");
unrelated.css = `background: none;
  ${a.foo.css}`;
const cssSourcemapData = [{className:'__styleThis_expression_11-g5yzc1',start:181,end:187},{className:'m-t2jk5y',start:248,end:266},{className:'b-0hyvwp',start:282,end:296},{className:'__styleThis_expression_6-t2j4xy',start:373,end:407},{className:'s1-9ebsxi',start:425,end:452},{className:'__styleThis_expression_3-xirstq',start:483,end:488},{className:'s2-f0l6r0',start:603,end:633},{className:'unrelated-h6bsx2',start:654,end:695}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/correctness-1/entry.tsx.css').resolve([
`.__styleThis_expression_11-g5yzc1 {
${__styleThis_expression_11.css}
}`,
`.m-t2jk5y {
${__styleThis_var_m_7.css}
}`,
`.b-0hyvwp {
${b.css}
}`,
`.__styleThis_expression_6-t2j4xy {
${__styleThis_expression_6.css}
}`,
`.s1-9ebsxi {
${__styleThis_var_s1_4.css}
}`,
`.__styleThis_expression_3-xirstq {
${__styleThis_expression_3.css}
}`,
`.s2-f0l6r0 {
${s2.css}
}`,
`.unrelated-h6bsx2 {
${unrelated.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/correctness-1/entry.tsx.css');
