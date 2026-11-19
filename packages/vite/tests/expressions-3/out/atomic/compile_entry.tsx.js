// /packages/vite/tests/expressions-3/entry.tsx: {"css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_var_color_8 = "red";
let __styleThis_var_size_7 = 4;
let __styleThis_var_theme_6 = {
	color: "blue",
	size: 8
};
let __styleThis_var_shorthand_5 = {
	color: __styleThis_var_color_8,
	size: __styleThis_var_size_7
};
let __styleThis_var_methods_4 = { color() {
	return "green";
} };
let __styleThis_var_pick_3 = ({ color: __styleThis_var_color_8 }) => __styleThis_var_color_8;
let __styleThis_expression_9 = __styleThis_var_theme_6;
let { size: __styleThis_var_padding_2 } = __styleThis_expression_9;
let __styleThis_var_button_1 = new String("button-st6jwl");
__styleThis_var_button_1.css = `color: ${__styleThis_var_theme_6.color};
    border-color: ${__styleThis_var_shorthand_5.color};
    outline-color: ${__styleThis_var_methods_4.color()};
    background: ${__styleThis_var_pick_3({ color: "yellow" })};
    margin: ${__styleThis_var_theme_6["size"]}px ${__styleThis_var_shorthand_5.size}px;
    padding: ${__styleThis_var_padding_2}px;
  `;
return {
"__styleThis_var_button_1": __styleThis_var_button_1.css
};
