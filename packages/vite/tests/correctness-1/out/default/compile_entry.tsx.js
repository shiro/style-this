// /packages/vite/tests/correctness-1/a.tsx (/packages/vite/tests/correctness-1/entry.tsx): {"__global__export__", "__styleThis_1", "__styleThis_2", "css", "foo"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let foo = new String("foo-l6j05a");
foo.css = `color: white;`;
let __styleThis_2 = new String("__styleThis_2-wduf4d");
__styleThis_2.css = `color: hotpink;
  `;
let __styleThis_1 = new String("__styleThis_1-gp6rwx");
__styleThis_1.css = `color: green;
    `;
class __global__export__ {
	static foo() {
		return __styleThis_1;
	}
}

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"] ?? {}), __global__export__,foo};

// /packages/vite/tests/correctness-1/entry.tsx: {"__styleThis_11", "__styleThis_3", "__styleThis_6", "a", "a1", "b", "color", "comp", "css", "mib", "mutate", "s2", "st", "style", "unrelated"}
"use strict";
const a = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"];
const mib = __styleThis_value_cache_ggghhhii["/packages/vite/tests/correctness-1/a.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let mutate = (v) => v;
let __styleThis_11 = new String("__styleThis_11-abwhir");
__styleThis_11.css = `background: black;`;
let __styleThis_var_a2_9 = () => {
	const a3 = () => {
		return __styleThis_11;
	};
	return a3();
};
let __styleThis_var_wi_8 = __styleThis_var_a2_9();
let __styleThis_var_m_7 = new String("m-9ib41m");
__styleThis_var_m_7.css = `${__styleThis_var_wi_8}
  `;
let a1 = () => {
	const a2 = __styleThis_var_a2_9;
	const wi = __styleThis_var_wi_8;
	const m = __styleThis_var_m_7;
	return wi;
};
let b = new String("b-aj4l6b");
b.css = `${a1()}`;
let __styleThis_6 = new String("__styleThis_6-irk5mb");
__styleThis_6.css = `background: blue;
    `;
let __styleThis_var_c_5 = () => __styleThis_6;
let __styleThis_var_s1_4 = new String("s1-gta3sx");
__styleThis_var_s1_4.css = `${__styleThis_var_c_5().css}
    `;
let __styleThis_3 = new String("__styleThis_3-q74xyr");
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
let s2 = new String("s2-3ctqjk");
s2.css = `${st}
  ${comp().css}`;
let unrelated = new String("unrelated-5y7cxe");
unrelated.css = `background: none;
  ${a.foo.css}`;
const cssSourcemapData = [{className:'__styleThis_11-abwhir',start:181,end:204},{className:'m-9ib41m',start:266,end:284},{className:'b-aj4l6b',start:313,end:329},{className:'__styleThis_6-irk5mb',start:406,end:440},{className:'s1-gta3sx',start:458,end:485},{className:'__styleThis_3-q74xyr',start:516,end:586},{className:'s2-3ctqjk',start:701,end:731},{className:'unrelated-5y7cxe',start:752,end:793}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/correctness-1/entry.tsx.css')?.resolve([
`.__styleThis_11-abwhir {
${__styleThis_11.css}
}`,
`.m-9ib41m {
${__styleThis_var_m_7.css}
}`,
`.b-aj4l6b {
${b.css}
}`,
`.__styleThis_6-irk5mb {
${__styleThis_6.css}
}`,
`.s1-gta3sx {
${__styleThis_var_s1_4.css}
}`,
`.__styleThis_3-q74xyr {
${__styleThis_3.css}
}`,
`.s2-3ctqjk {
${s2.css}
}`,
`.unrelated-5y7cxe {
${unrelated.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/correctness-1/entry.tsx.css');
