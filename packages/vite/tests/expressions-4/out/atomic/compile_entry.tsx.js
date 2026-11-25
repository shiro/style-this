// /packages/vite/tests/expressions-4/entry.tsx: {"__styleThis_1", "__styleThis_10", "__styleThis_11", "__styleThis_2", "__styleThis_3", "__styleThis_4", "__styleThis_5", "__styleThis_6", "__styleThis_7", "__styleThis_8", "__styleThis_9", "arrow", "conditional", "css", "dark", "direct", "extraClass", "hover", "mixin", "multiLevel", "style"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let dark = true;
let __styleThis_11 = new String("__styleThis_11-0lajop");
__styleThis_11.css = `color: green;`;
let direct = new String("direct-3k163k");
direct.css = `.${__styleThis_11}:hover & {
    color: red;
  }`;
let __styleThis_10 = new String("__styleThis_10-1i7cpm");
__styleThis_10.css = `color: white;`;
let __styleThis_9 = new String("__styleThis_9-z0xevk");
__styleThis_9.css = `color: black;`;
let conditional = new String("conditional-f8lqns");
conditional.css = `.${dark ? __styleThis_9 : __styleThis_10} & {
    color: blue;
  }`;
let __styleThis_8 = new String("__styleThis_8-k1in8h");
__styleThis_8.css = `color: pink;`;
let arrow = new String("arrow-6no9a3");
arrow.css = `.${(() => __styleThis_8)()} & {
    color: gray;
  }`;
let __styleThis_7 = new String("__styleThis_7-3cxmv0");
__styleThis_7.css = `color: orange; `;
let __styleThis_6 = new String("__styleThis_6-563sxy");
__styleThis_6.css = `.${__styleThis_7} & { color: purple; }`;
let multiLevel = new String("multiLevel-ebk52z");
multiLevel.css = `.${__styleThis_6} & {
    color: yellow;
  }`;
let __styleThis_5 = new String("__styleThis_5-4dmvst");
__styleThis_5.css = `color: teal;`;
let hover = `.${__styleThis_5}:hover & {
    color: navy;
  }`;
let mixin = new String("mixin-gtuzot");
mixin.css = `${hover}`;
let __styleThis_2 = new String("__styleThis_2-ez4tqj");
__styleThis_2.css = `color: lime;`;
let __styleThis_1 = new String("__styleThis_1-jwhmbc");
__styleThis_1.css = `.${__styleThis_2} & {
      color: maroon;
    }
  `;
let __styleThis_var_color_2 = "olive";
let __styleThis_var_tint_1 = `background: ${__styleThis_var_color_2};`;
let __styleThis_4 = new String("__styleThis_4-4hinch");
__styleThis_4.css = `color: ${__styleThis_var_color_2};`;
let __styleThis_3 = new String("__styleThis_3-fst6n8");
__styleThis_3.css = `.${__styleThis_4} & {
      ${__styleThis_var_tint_1}
    }
  `;
return {
"direct": direct.css,
"__styleThis_11": __styleThis_11.css,
"conditional": conditional.css,
"__styleThis_10": __styleThis_10.css,
"__styleThis_9": __styleThis_9.css,
"arrow": arrow.css,
"__styleThis_8": __styleThis_8.css,
"multiLevel": multiLevel.css,
"__styleThis_6": __styleThis_6.css,
"__styleThis_7": __styleThis_7.css,
"__styleThis_5": __styleThis_5.css,
"mixin": mixin.css,
"__styleThis_3": __styleThis_3.css,
"__styleThis_4": __styleThis_4.css,
"__styleThis_1": __styleThis_1.css,
"__styleThis_2": __styleThis_2.css
};
