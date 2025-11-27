"use strict";
let mutate = (v) => v;
let var_145_179 = new String("var_145_179-opppqq");
var_145_179.css = `background: blue;
    `;
let __styleThis_var_c_7 = () => var_145_179;
let __styleThis_var_s1_6 = new String("s1-mmnnoo");
__styleThis_var_s1_6.css = `${__styleThis_var_c_7().css}
    `;
let var_255_260 = new String("var_255_260-kklllm");
var_255_260.css = ``;
let a = () => {
("foob");
	const b = undefined;
	mutate(b);
	return var_255_260;
};
let st = `color: pink;`;
let s2 = new String("s2-iijjjk");
s2.css = `${st}
  ${a().css}`;
let unrelated = new String("unrelated-ggghhh");
unrelated.css = `background: none;`;

__styleThis_aabbbccc.set('/entry.tsx.css', [
`.unrelated-ggghhh {
${unrelated.css}
}`,
`.s1-mmnnoo {
${__styleThis_var_s1_6.css}
}`,
`.s2-iijjjk {
${s2.css}
}`,
`.var_255_260-kklllm {
${var_255_260.css}
}`,
`.var_145_179-opppqq {
${var_145_179.css}
}`
].join('\n'));