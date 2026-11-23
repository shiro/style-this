// /packages/vite/tests/exported-declarations-1/b.tsx (/packages/vite/tests/exported-declarations-1/entry.tsx): {"Theme", "__styleThis_1", "__styleThis_2", "__styleThis_3", "accent", "border", "borderStyle", "css", "decoration", "focus", "getLink", "outline", "underline", "weight"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_3 = new String("__styleThis_3-7styr4");
let accent = "blue";
let borderStyle = "solid";
let border = `1px ${borderStyle} ${accent}`;
let decoration = "none";
let __styleThis_2 = new String("__styleThis_2-9erkd2");
__styleThis_2.css = `outline: none;`;
function focus() {
	return __styleThis_2;
}
__styleThis_3.css = `text-decoration: ${underline(false)};
    border-bottom: ${border};
    ${focus().css}
  `;
function getLink() {
	return __styleThis_3;
}
function underline(enabled) {
	return enabled ? "underline" : decoration;
}
let outline = accent;
let __styleThis_1 = new String("__styleThis_1-hi3g5a");
__styleThis_1.css = `color: ${accent};
    outline-color: ${outline};
    text-decoration: ${underline(true)};
  `;
class Theme {
	static accent = __styleThis_1;
}
let __styleThis_expression_1 = { weight: "bold" };
let { weight } = __styleThis_expression_1;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] ?? {}), Theme,getLink,weight};

// /packages/vite/tests/exported-declarations-1/entry.tsx: {"Theme", "__styleThis_1", "__styleThis_2", "__styleThis_3", "color", "css", "getLink", "nav", "weight"}
"use strict";
const weight = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["weight"];
const Theme = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Theme"];
const getLink = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["getLink"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let nav = new String("nav-4xyb4t");
nav.css = `.${getLink()}, .${Theme.accent} {
    font-weight: ${weight};
  }`;
let __styleThis_1 = new String("__styleThis_1-t6jshu");
__styleThis_1.css = `display: flex;
  `;
let __styleThis_3 = new String("__styleThis_3-avo1ib");
__styleThis_3.css = `margin: 8px;
    `;
let __styleThis_2 = new String("__styleThis_2-nwt6zk");
__styleThis_2.css = `padding: 4px;
  `;
let __styleThis_var_button_1 = new String("button-lajgtq");
__styleThis_var_button_1.css = `color: ${color};
  `;
return {
"nav": nav.css,
"__styleThis_var_button_1": __styleThis_var_button_1.css,
"__styleThis_3": __styleThis_3.css,
"__styleThis_2": __styleThis_2.css,
"__styleThis_1": __styleThis_1.css
};
