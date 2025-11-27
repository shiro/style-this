"use strict";
let { css } = require("/home/shiro/project/style-this/packages/core/dist/index.mjs");
let outer = () => {
	const inner = () => {
		return __styleThis_css_98_132;
	};
	return __styleThis_css_148_191;
};
let __styleThis_var_inner_0 = () => {
	return __styleThis_css_98_132;
};
let __styleThis_css_98_132 = new String("__styleThis_css_98_132-iijjjk");
__styleThis_css_98_132.css = `
      background: blue;
    `;
let __styleThis_css_148_191 = new String("__styleThis_css_148_191-ggghhh");
__styleThis_css_148_191.css = `
    ${__styleThis_var_inner_0().css}
    color: red;
  `;

__styleThis_aabbbccc.set('/entry.tsx.css', [
`.__styleThis_css_148_191-ggghhh {
${__styleThis_css_148_191.css}
}`,
`.__styleThis_css_98_132-iijjjk {
${__styleThis_css_98_132.css}
}`
].join('\n\n'));