// /packages/vite/tests/exported-declarations-1/b.tsx (/packages/vite/tests/exported-declarations-1/entry.tsx): {"Theme", "__styleThis_1", "__styleThis_2", "css", "getLink"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_2 = new String("__styleThis_2-9erkd2");
__styleThis_2.css = `text-decoration: none;
  `;
function getLink() {
	return __styleThis_2;
}
let __styleThis_1 = new String("__styleThis_1-hi3g5a");
__styleThis_1.css = `color: blue;
  `;
class Theme {
	static accent = __styleThis_1;
}

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] ?? {}), Theme,getLink};

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
return {
"nav": nav.css,
"__styleThis_var_button_4": __styleThis_var_button_4.css,
"__styleThis_3": __styleThis_3.css,
"__styleThis_2": __styleThis_2.css,
"__styleThis_1": __styleThis_1.css
};
