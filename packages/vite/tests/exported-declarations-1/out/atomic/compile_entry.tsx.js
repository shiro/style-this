// /packages/vite/tests/exported-declarations-1/b.tsx (/packages/vite/tests/exported-declarations-1/entry.tsx): {"Badge", "Inner", "InnerSizes", "Palette", "Sizes", "Theme", "Weight", "__global__export__", "__styleThis_1", "__styleThis_2", "__styleThis_3", "__styleThis_4", "accent", "border", "borderStyle", "css", "decoration", "focus", "getLink", "grid", "outline", "underline", "weight"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let __styleThis_4 = new String("__styleThis_4-in0x67");
let accent = "blue";
let borderStyle = "solid";
let border = `1px ${borderStyle} ${accent}`;
let decoration = "none";
let __styleThis_3 = new String("__styleThis_3-lq7gp6");
__styleThis_3.css = `outline: none;`;
function focus() {
	return __styleThis_3;
}
__styleThis_4.css = `text-decoration: ${underline(false)};
    border-bottom: ${border};
    ${focus().css}
  `;
function getLink() {
	return __styleThis_4;
}
function underline(enabled) {
	return enabled ? "underline" : decoration;
}
let outline = accent;
let __styleThis_2 = new String("__styleThis_2-fkp63g");
__styleThis_2.css = `color: ${accent};
    outline-color: ${outline};
    text-decoration: ${underline(true)};
  `;
class Theme {
	static accent = __styleThis_2;
}
let __styleThis_expression_7 = { weight: "bold" };
let { weight } = __styleThis_expression_7;
let __styleThis_var_gap_5 = "2px";
let __styleThis_var_Inner_4;
(function(__styleThis_var_Inner_5) {
	const gap = __styleThis_var_Inner_5.gap = "3px";
})(__styleThis_var_Inner_4 || (__styleThis_var_Inner_4 = {}));
let __styleThis_var_Nested_3 = __styleThis_var_Inner_4;
let __styleThis_var_card_2 = new String("card-7styr4");
__styleThis_var_card_2.css = `gap: ${__styleThis_var_gap_5};
    padding: ${__styleThis_var_Nested_3.gap};
  `;
let Sizes;
(function(_Sizes) {
	const gap = _Sizes.gap = __styleThis_var_gap_5;
	let Inner;
	(function(_Inner) {
		const gap = _Inner.gap = "3px";
	})(Inner || (Inner = _Sizes.Inner || (_Sizes.Inner = {})));
	const card = _Sizes.card = __styleThis_var_card_2;
})(Sizes || (Sizes = {}));
var Weight = /* @__PURE__ */ function(Weight) {
	Weight["Bold"] = "bold";
	return Weight;
}(Weight || {});
function Badge() {
	return "badge";
}
(function(_Badge) {
	const color = _Badge.color = "olive";
})(Badge || (Badge = {}));
let Inner = Sizes.Inner;
let InnerSizes = Sizes.Inner;
let grid = new String("grid-9erkd2");
grid.css = `gap: ${Sizes.gap};
  padding: ${Inner.gap};
  font-weight: ${Weight.Bold};
  color: ${Badge.color};`;
let __styleThis_1 = new String("__styleThis_1-hi3g5a");
class Palette {
	static primary = "teal";
	static accent = __styleThis_1;
}
__styleThis_1.css = `color: ${Palette.primary};
  `;
let __global__export__ = Palette;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"] ?? {}), Badge,InnerSizes,Sizes,Theme,Weight,__global__export__,getLink,weight};

// /packages/vite/tests/exported-declarations-1/c.tsx (/packages/vite/tests/exported-declarations-1/entry.tsx): {"__global__export__", "rounded"}
"use strict";
function rounded() {
	return "rounded";
}
let __global__export__ = rounded;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/c.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/c.tsx"] ?? {}), __global__export__};

// /packages/vite/tests/exported-declarations-1/entry.tsx: {"Badge", "InnerSizes", "Page", "Palette", "Sizes", "Theme", "Weight", "__styleThis_1", "__styleThis_2", "__styleThis_3", "b", "color", "css", "getLink", "nav", "page", "rounded", "weight"}
"use strict";
const rounded = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/c.tsx"]["__global__export__"];
const b = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"];
const Weight = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Weight"];
const weight = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["weight"];
const Theme = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Theme"];
const Sizes = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Sizes"];
const getLink = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["getLink"];
const Badge = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["Badge"];
const Palette = __styleThis_value_cache_ggghhhii["/packages/vite/tests/exported-declarations-1/b.tsx"]["__global__export__"];
let { css } = require("/packages/core/dist/index.mjs");
let InnerSizes = b.InnerSizes;
let color = "red";
let nav = new String("nav-4h6fk9");
nav.css = `.${getLink()}, .${Theme.accent} {
    font-weight: ${weight};
  }`;
let page = new String("page-4xyb4t");
let __styleThis_1 = new String("__styleThis_1-t6jshu");
__styleThis_1.css = `display: flex;
  `;
function Page() {
	return __styleThis_1;
}
page.css = `.${Page()} > .${Palette.accent}, .${rounded()}, .${Sizes.card} {
    gap: ${Sizes.gap};
    font-weight: ${Weight.Bold};
    color: ${Badge.color};
    padding: ${InnerSizes.gap};
  }`;
let __styleThis_var_button_1 = new String("button-lajgtq");
__styleThis_var_button_1.css = `color: ${color};
  `;
let __styleThis_3 = new String("__styleThis_3-avo1ib");
__styleThis_3.css = `margin: 8px;
    `;
let __styleThis_2 = new String("__styleThis_2-nwt6zk");
__styleThis_2.css = `padding: 4px;
  `;
return {
"nav": nav.css,
"page": page.css,
"__styleThis_var_button_1": __styleThis_var_button_1.css,
"__styleThis_3": __styleThis_3.css,
"__styleThis_2": __styleThis_2.css,
"__styleThis_1": __styleThis_1.css
};
