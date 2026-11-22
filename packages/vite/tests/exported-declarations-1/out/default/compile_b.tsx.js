// /packages/vite/tests/exported-declarations-1/b.tsx (/packages/vite/tests/exported-declarations-1/entry.tsx): {"Theme", "__styleThis_1", "__styleThis_2", "accent", "border", "css", "decoration", "getLink", "outline", "underline"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let decoration = "none";
let accent = "blue";
let border = `1px solid ${accent}`;
let outline = accent;
function underline(enabled) {
	return enabled ? "underline" : decoration;
}
let __styleThis_2 = new String("__styleThis_2-9erkd2");
__styleThis_2.css = `text-decoration: ${underline(false)};
    border-bottom: ${border};
  `;
function getLink() {
	return __styleThis_2;
}
let __styleThis_1 = new String("__styleThis_1-hi3g5a");
__styleThis_1.css = `color: ${accent};
    outline-color: ${outline};
  `;
class Theme {
	static accent = __styleThis_1;
}

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] ?? {}), Theme,getLink};

// /packages/vite/tests/exported-declarations-1/b.tsx: {"__styleThis_1", "__styleThis_2", "accent", "border", "css", "decoration", "outline", "underline"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let decoration = "none";
let accent = "blue";
let border = `1px solid ${accent}`;
let outline = accent;
function underline(enabled) {
	return enabled ? "underline" : decoration;
}
let __styleThis_2 = new String("__styleThis_2-9erkd2");
__styleThis_2.css = `text-decoration: ${underline(false)};
    border-bottom: ${border};
  `;
let __styleThis_1 = new String("__styleThis_1-hi3g5a");
__styleThis_1.css = `color: ${accent};
    outline-color: ${outline};
  `;
return [
`.__styleThis_2-9erkd2 {
${__styleThis_2.css}
}`,
`.__styleThis_1-hi3g5a {
${__styleThis_1.css}
}`
].join('\n');


// /packages/vite/tests/exported-declarations-1/entry.tsx: {"Theme", "__styleThis_1", "__styleThis_2", "__styleThis_3", "color", "css", "getLink", "nav"}
"use strict";
const Theme = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Theme"];
const getLink = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["getLink"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let nav = new String("nav-4xyb4t");
nav.css = `.${getLink()}, .${Theme.accent} {
    font-weight: bold;
  }`;
let __styleThis_var_button_4 = new String("button-lajgtq");
__styleThis_var_button_4.css = `color: ${color};
  `;
let __styleThis_3 = new String("__styleThis_3-avo1ib");
__styleThis_3.css = `margin: 8px;
    `;
let __styleThis_2 = new String("__styleThis_2-nwt6zk");
__styleThis_2.css = `padding: 4px;
  `;
let __styleThis_1 = new String("__styleThis_1-t6jshu");
__styleThis_1.css = `display: flex;
  `;
return [
`.nav-4xyb4t {
${nav.css}
}`,
`.button-lajgtq {
${__styleThis_var_button_4.css}
}`,
`.__styleThis_3-avo1ib {
${__styleThis_3.css}
}`,
`.__styleThis_2-nwt6zk {
${__styleThis_2.css}
}`,
`.__styleThis_1-t6jshu {
${__styleThis_1.css}
}`
].join('\n');
