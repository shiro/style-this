/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 791:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


// EXTERNAL MODULE: ../../node_modules/.pnpm/react@19.2.8/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(206);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react@19.2.8/node_modules/react/index.js
var react = __webpack_require__(982);
// EXTERNAL MODULE: ../../node_modules/.pnpm/react-dom@19.2.8_react@19.2.8/node_modules/react-dom/client.js
var client = __webpack_require__(299);
;// ../../packages/core/dist/index.mjs
//#region src/atomicPrefixes.json
var atomicPrefixes_default = {
	margin: "m",
	"margin-top": "mt",
	"margin-right": "mr",
	"margin-bottom": "mb",
	"margin-left": "ml",
	"margin-inline": "mx",
	"margin-block": "my",
	"margin-inline-start": "ms",
	"margin-inline-end": "me",
	"margin-block-start": "mbs",
	"margin-block-end": "mbe",
	padding: "p",
	"padding-top": "pt",
	"padding-right": "pr",
	"padding-bottom": "pb",
	"padding-left": "pl",
	"padding-inline": "px",
	"padding-block": "py",
	"padding-inline-start": "ps",
	"padding-inline-end": "pe",
	"padding-block-start": "pbs",
	"padding-block-end": "pbe",
	width: "w",
	"min-width": "min-w",
	"max-width": "max-w",
	height: "h",
	"min-height": "min-h",
	"max-height": "max-h",
	"aspect-ratio": "aspect",
	"box-sizing": "box",
	display: "d",
	position: "pos",
	inset: "inset",
	"inset-inline": "inset-x",
	"inset-block": "inset-y",
	"inset-inline-start": "inset-s",
	"inset-inline-end": "inset-e",
	"inset-block-start": "inset-bs",
	"inset-block-end": "inset-be",
	top: "top",
	right: "right",
	bottom: "bottom",
	left: "left",
	"z-index": "z",
	float: "float",
	clear: "clear",
	isolation: "isolate",
	overflow: "overflow",
	"overflow-x": "overflow-x",
	"overflow-y": "overflow-y",
	"overflow-inline": "overflow-inline",
	"overflow-block": "overflow-block",
	visibility: "visibility",
	opacity: "opacity",
	flex: "flex",
	"flex-direction": "flex-d",
	"flex-wrap": "flex-w",
	"flex-flow": "flex-f",
	"flex-grow": "grow",
	"flex-shrink": "shrink",
	"flex-basis": "basis",
	order: "order",
	gap: "gap",
	"row-gap": "gap-y",
	"column-gap": "gap-x",
	"align-items": "items",
	"align-content": "content",
	"align-self": "self",
	"justify-content": "justify",
	"justify-items": "justify-items",
	"justify-self": "justify-self",
	"place-items": "place-items",
	"place-content": "place-content",
	"place-self": "place-self",
	grid: "grid",
	"grid-template": "grid-t",
	"grid-template-columns": "grid-cols",
	"grid-template-rows": "grid-rows",
	"grid-template-areas": "grid-areas",
	"grid-auto-flow": "grid-flow",
	"grid-auto-columns": "auto-cols",
	"grid-auto-rows": "auto-rows",
	"grid-area": "area",
	"grid-column": "col",
	"grid-column-start": "col-start",
	"grid-column-end": "col-end",
	"grid-row": "row",
	"grid-row-start": "row-start",
	"grid-row-end": "row-end",
	columns: "columns",
	"column-width": "col-w",
	"column-count": "col-count",
	"column-height": "col-h",
	"column-wrap": "col-wrap",
	color: "c",
	font: "f",
	"font-family": "ff",
	"font-size": "fs",
	"font-weight": "fw",
	"font-style": "fst",
	"font-variant": "fv",
	"font-variant-caps": "fvc",
	"font-stretch": "fstr",
	"font-width": "fstr",
	"font-variant-ligatures": "fvl",
	"font-variant-alternates": "fva",
	"font-variant-numeric": "fvn",
	"font-variant-east-asian": "fvea",
	"font-variant-position": "fvp",
	"font-variant-emoji": "fve",
	"font-kerning": "fk",
	"font-size-adjust": "fsa",
	"font-feature-settings": "ffs",
	"font-variation-settings": "fvs",
	"font-optical-sizing": "fos",
	"font-language-override": "flo",
	"line-height": "lh",
	"letter-spacing": "ls",
	"word-spacing": "wsp",
	"text-align": "ta",
	"text-decoration": "td",
	"text-decoration-line": "tdl",
	"text-decoration-thickness": "tdt",
	"text-decoration-style": "tds",
	"text-decoration-color": "tdc",
	"text-transform": "tt",
	"text-overflow": "to",
	"text-indent": "ti",
	"text-shadow": "tsh",
	"white-space": "ws",
	"white-space-collapse": "wsc",
	"white-space-trim": "wst",
	"text-wrap": "tw",
	"text-wrap-mode": "twm",
	"text-wrap-style": "tws",
	"word-break": "wb",
	"overflow-wrap": "ow",
	"vertical-align": "va",
	"alignment-baseline": "align-baseline",
	"baseline-shift": "baseline-shift",
	"baseline-source": "baseline-source",
	"list-style": "list",
	"list-style-type": "list-t",
	"list-style-position": "list-p",
	"list-style-image": "list-i",
	content: "cnt",
	background: "bg",
	"background-color": "bgc",
	"background-image": "bgi",
	"background-size": "bgs",
	"background-position": "bgp",
	"background-position-x": "bgpx",
	"background-position-y": "bgpy",
	"background-repeat": "bgr",
	"background-clip": "bgcl",
	"background-attachment": "bga",
	"background-origin": "bgo",
	"background-blend-mode": "bgbm",
	border: "b",
	"border-top": "bt",
	"border-right": "br",
	"border-bottom": "bb",
	"border-left": "bl",
	"border-inline": "bx",
	"border-block": "by",
	"border-inline-start": "bxs",
	"border-inline-end": "bxe",
	"border-block-start": "bys",
	"border-block-end": "bye",
	"border-inline-width": "bxw",
	"border-inline-style": "bxst",
	"border-inline-color": "bxc",
	"border-block-width": "byw",
	"border-block-style": "byst",
	"border-block-color": "byc",
	"border-width": "bw",
	"border-style": "bs",
	"border-color": "bc",
	"border-top-width": "btw",
	"border-top-style": "bts",
	"border-top-color": "btc",
	"border-right-width": "brw",
	"border-right-style": "brs",
	"border-right-color": "brc",
	"border-bottom-width": "bbw",
	"border-bottom-style": "bbs",
	"border-bottom-color": "bbc",
	"border-left-width": "blw",
	"border-left-style": "bls",
	"border-left-color": "blc",
	"border-inline-start-width": "bxsw",
	"border-inline-start-style": "bxss",
	"border-inline-start-color": "bxsc",
	"border-inline-end-width": "bxew",
	"border-inline-end-style": "bxes",
	"border-inline-end-color": "bxec",
	"border-block-start-width": "bysw",
	"border-block-start-style": "byss",
	"border-block-start-color": "bysc",
	"border-block-end-width": "byew",
	"border-block-end-style": "byes",
	"border-block-end-color": "byec",
	"border-image": "bi",
	"border-image-source": "bis",
	"border-image-slice": "bisl",
	"border-image-width": "biw",
	"border-image-outset": "bio",
	"border-image-repeat": "bir",
	"border-radius": "r",
	"border-top-left-radius": "rtl",
	"border-top-right-radius": "rtr",
	"border-bottom-right-radius": "rbr",
	"border-bottom-left-radius": "rbl",
	"border-start-start-radius": "rss",
	"border-start-end-radius": "rse",
	"border-end-start-radius": "res",
	"border-end-end-radius": "ree",
	"border-collapse": "b-collapse",
	"border-spacing": "b-spacing",
	outline: "ol",
	"outline-width": "olw",
	"outline-style": "ols",
	"outline-color": "olc",
	"outline-offset": "olo",
	"box-shadow": "shadow",
	filter: "filter",
	"backdrop-filter": "backdrop",
	"mix-blend-mode": "blend",
	"object-fit": "object",
	"object-position": "object-p",
	transform: "transform",
	"transform-origin": "origin",
	transition: "transition",
	"transition-property": "transition-p",
	"transition-duration": "duration",
	"transition-timing-function": "ease",
	"transition-delay": "delay",
	"transition-behavior": "transition-b",
	animation: "animate",
	"animation-name": "animate-name",
	"animation-duration": "animate-duration",
	"animation-timing-function": "animate-ease",
	"animation-iteration-count": "animate-count",
	"animation-direction": "animate-direction",
	"animation-play-state": "animate-state",
	"animation-delay": "animate-delay",
	"animation-fill-mode": "animate-fill",
	"animation-timeline": "animate-timeline",
	"animation-range": "animate-range",
	"animation-range-start": "animate-range-start",
	"animation-range-end": "animate-range-end",
	"will-change": "will",
	cursor: "cursor",
	"pointer-events": "ptr",
	"user-select": "select",
	resize: "resize",
	appearance: "appearance",
	"scroll-behavior": "scroll",
	"caret-color": "caret",
	"accent-color": "accent",
	"table-layout": "table",
	fill: "fill",
	stroke: "stroke",
	"stroke-width": "stroke-w"
};

//#endregion
//#region src/atomicShorthands.json
var atomicShorthands_default = {
	margin: "margin-top margin-right margin-bottom margin-left margin-inline margin-block margin-inline-start margin-inline-end margin-block-start margin-block-end",
	"margin-inline": "margin-inline-start margin-inline-end",
	"margin-block": "margin-block-start margin-block-end",
	padding: "padding-top padding-right padding-bottom padding-left padding-inline padding-block padding-inline-start padding-inline-end padding-block-start padding-block-end",
	"padding-inline": "padding-inline-start padding-inline-end",
	"padding-block": "padding-block-start padding-block-end",
	inset: "top right bottom left inset-inline inset-block inset-inline-start inset-inline-end inset-block-start inset-block-end",
	"inset-inline": "inset-inline-start inset-inline-end",
	"inset-block": "inset-block-start inset-block-end",
	overflow: "overflow-x overflow-y overflow-inline overflow-block",
	flex: "flex-grow flex-shrink flex-basis",
	"flex-flow": "flex-direction flex-wrap",
	gap: "row-gap column-gap",
	"place-items": "align-items justify-items",
	"place-content": "align-content justify-content",
	"place-self": "align-self justify-self",
	grid: "grid-template grid-template-columns grid-template-rows grid-template-areas grid-auto-flow grid-auto-columns grid-auto-rows",
	"grid-template": "grid-template-columns grid-template-rows grid-template-areas",
	"grid-area": "grid-column grid-row grid-column-start grid-column-end grid-row-start grid-row-end",
	"grid-column": "grid-column-start grid-column-end",
	"grid-row": "grid-row-start grid-row-end",
	columns: "column-width column-count column-height column-wrap",
	font: "font-family font-size font-weight font-style font-variant line-height font-variant-caps font-stretch font-width font-variant-ligatures font-variant-alternates font-variant-numeric font-variant-east-asian font-variant-position font-variant-emoji font-kerning font-size-adjust font-feature-settings font-variation-settings font-optical-sizing font-language-override",
	"font-variant": "font-variant-caps font-variant-ligatures font-variant-alternates font-variant-numeric font-variant-east-asian font-variant-position font-variant-emoji",
	"text-decoration": "text-decoration-line text-decoration-thickness text-decoration-style text-decoration-color",
	"white-space": "white-space-collapse text-wrap-mode white-space-trim",
	"text-wrap": "text-wrap-mode text-wrap-style",
	"vertical-align": "alignment-baseline baseline-shift baseline-source",
	"list-style": "list-style-type list-style-position list-style-image",
	background: "background-color background-image background-size background-position background-repeat background-clip background-attachment background-origin background-position-x background-position-y",
	"background-position": "background-position-x background-position-y",
	border: "border-top border-right border-bottom border-left border-inline border-block border-inline-start border-inline-end border-inline-width border-inline-style border-inline-color border-block-start border-block-end border-block-width border-block-style border-block-color border-width border-style border-color border-image border-top-width border-top-style border-top-color border-right-width border-right-style border-right-color border-bottom-width border-bottom-style border-bottom-color border-left-width border-left-style border-left-color border-inline-start-width border-inline-start-style border-inline-start-color border-inline-end-width border-inline-end-style border-inline-end-color border-block-start-width border-block-start-style border-block-start-color border-block-end-width border-block-end-style border-block-end-color border-image-source border-image-slice border-image-width border-image-outset border-image-repeat",
	"border-top": "border-top-width border-top-style border-top-color",
	"border-right": "border-right-width border-right-style border-right-color",
	"border-bottom": "border-bottom-width border-bottom-style border-bottom-color",
	"border-left": "border-left-width border-left-style border-left-color",
	"border-inline": "border-inline-start border-inline-end border-inline-width border-inline-style border-inline-color border-inline-start-width border-inline-start-style border-inline-start-color border-inline-end-width border-inline-end-style border-inline-end-color",
	"border-block": "border-block-start border-block-end border-block-width border-block-style border-block-color border-block-start-width border-block-start-style border-block-start-color border-block-end-width border-block-end-style border-block-end-color",
	"border-inline-start": "border-inline-start-width border-inline-start-style border-inline-start-color",
	"border-inline-end": "border-inline-end-width border-inline-end-style border-inline-end-color",
	"border-block-start": "border-block-start-width border-block-start-style border-block-start-color",
	"border-block-end": "border-block-end-width border-block-end-style border-block-end-color",
	"border-inline-width": "border-inline-start-width border-inline-end-width",
	"border-inline-style": "border-inline-start-style border-inline-end-style",
	"border-inline-color": "border-inline-start-color border-inline-end-color",
	"border-block-width": "border-block-start-width border-block-end-width",
	"border-block-style": "border-block-start-style border-block-end-style",
	"border-block-color": "border-block-start-color border-block-end-color",
	"border-width": "border-top-width border-right-width border-bottom-width border-left-width",
	"border-style": "border-top-style border-right-style border-bottom-style border-left-style",
	"border-color": "border-top-color border-right-color border-bottom-color border-left-color",
	"border-image": "border-image-source border-image-slice border-image-width border-image-outset border-image-repeat",
	"border-radius": "border-top-left-radius border-top-right-radius border-bottom-right-radius border-bottom-left-radius border-start-start-radius border-start-end-radius border-end-start-radius border-end-end-radius",
	outline: "outline-width outline-style outline-color",
	transition: "transition-property transition-duration transition-timing-function transition-delay transition-behavior",
	animation: "animation-name animation-duration animation-timing-function animation-iteration-count animation-direction animation-play-state animation-delay animation-fill-mode animation-timeline animation-range animation-range-start animation-range-end",
	"animation-range": "animation-range-start animation-range-end"
};

//#endregion
//#region src/index.ts
const css = (..._raw) => {
	throw new Error("@style-this: called 'css' at runtime. This indicates an error in the transform.");
};
const style = (s, ...expr) => {
	let res = "";
	for (let i = 0; i < Math.max(s.length, expr.length); ++i) {
		res += s[i] ?? "";
		res += expr[i] ?? "";
	}
	return res;
};
const extraClass = (..._classes) => {
	throw new Error("@style-this: called 'extraClass' at runtime. This indicates an error in the transform.");
};
const ATOMIC_PREFIXES = new Set(Object.values(atomicPrefixes_default));
const prefixOf = (property) => atomicPrefixes_default[property];
/** Prefix of a shorthand -> prefixes of the longhands it overrides, e.g. `m` -> `mt`, `mb`, ... */
const LONGHAND_PREFIXES = new Map(Object.entries(atomicShorthands_default).map(([shorthand, longhands]) => [prefixOf(shorthand), longhands.split(" ").map(prefixOf)]));
const ATOMIC_CLASS = /^(.+)-[A-Z][\w-]{4}$/;
const getAtomicPrefix = (className) => {
	const prefix = ATOMIC_CLASS.exec(className)?.[1];
	return prefix && ATOMIC_PREFIXES.has(prefix) ? prefix : void 0;
};
/** Joins class lists, ignoring falsy values. */
const joinStyles = (...classes) => classes.filter(Boolean).join(" ");
/**
* Joins class lists, de-duping atomic classes of the same property (e.g. `m-xxxxx`), the last one wins.
* Atomic classes of longhands followed by their shorthand (e.g. `mt-xxxxx` before `m-xxxxx`) are dropped
* too, longhands would win otherwise. Other classes are only de-duped if identical. Falsy values are ignored.
* In non-atomic mode the transform replaces this with `joinStyles`.
*/
const mergeStyles = (...classes) => {
	const merged = /* @__PURE__ */ new Map();
	for (const classList of classes) {
		if (!classList) continue;
		for (const className of classList.split(/\s+/)) {
			if (!className) continue;
			const prefix = getAtomicPrefix(className);
			if (prefix) for (const longhand of LONGHAND_PREFIXES.get(prefix) ?? []) merged.delete(longhand);
			const key = prefix ?? className;
			merged.delete(key);
			merged.set(key, className);
		}
	}
	return [...merged.values()].join(" ");
};
/**
* Merges a styled component's CSS variables with the `style` prop, which wins on conflicts.
* The `style` prop may be a CSS string (e.g. in Solid), in which case CSS text is returned.
*/
const mergeInlineStyles = (vars, style$1) => {
	if (typeof style$1 !== "string") return {
		...vars,
		...style$1
	};
	let res = "";
	for (const [name, value] of Object.entries(vars)) if (value != null) res += `${name}:${value};`;
	return res + style$1;
};

//#endregion

//# sourceMappingURL=index.mjs.map
;// ../../packages/react/dist/index.mjs
//#region src/index.ts
const styled = new Proxy((() => {}), {
	apply(_target, _thisArg, [baseComponent]) {
		return (..._args) => {
			throw new Error(`@style-this: called 'styled(${String(baseComponent)})' at runtime. This indicates an error in the transform.`);
		};
	},
	get(_target, elementName) {
		return (..._args) => {
			throw new Error(`@style-this: called 'styled.${String(elementName)}' at runtime. This indicates an error in the transform.`);
		};
	}
});

//#endregion

//# sourceMappingURL=index.mjs.map
;// ./src/b.tsx

const exportedNumberB = 2;
const exportedColorB = "yellow";

;// ./src/a.ts


const exportedNumberA = exportedNumberB * 2;
const a_exportedColorA = "light" + exportedColorB;

;// ../../packages/webpack/style-this.atomic-program.js?filepath=..%2F..%2Fexamples%2Fwebpack%2Fsrc%2FCounter.tsx

const CounterStyle = "CounterStyle-zodu74 b-ZeplZ bg-LPp8Q d-W_vHB gap-Td5yX items-Im4M1 m-AuUyl p-DLlYK r-K5PNW something";
const __styleThis_var_FancyButton_6 = "FancyButton-otinw9 b-ZeplZ bg-Kk7Cm p-ZFXvv r-TbAuj";
const __styleThis_var_FancyButton2_4 = "FancyButton2-wtirkd bg-XgLHP cursor-ALqk3 m-LjJyB min-h-LEqJt";

;// ./src/Counter.tsx

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};










const spacing = 16;
const Counter_CounterStyle = CounterStyle;
const FancyButton = (() => {
  let __styleThis__class = __styleThis_var_FancyButton_6;
  let __styleThis__comp = (0,react.forwardRef)((__styleThis__props, __styleThis__ref) => {
    var _b;
    const _a = __styleThis__props, { styleProps: __styleThis__styleProps, style: __styleThis__style } = _a, __styleThis__rest = __objRest(_a, ["styleProps", "style"]);
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("button", __spreadProps(__spreadValues({}, __styleThis__rest), { ref: __styleThis__ref, className: mergeStyles(__styleThis__class, __styleThis__rest.className), style: __spreadValues({
      "--var1-enc92j": (({ a }) => `${a}px`)(__spreadProps(__spreadValues({}, __styleThis__props.styleProps), {
        "props": __styleThis__props
      }))
    }, (_b = __styleThis__props.style) != null ? _b : {}) }));
  });
  __styleThis__comp.toString = () => __styleThis__class;
  return __styleThis__comp;
})();
const FancyButton2 = (() => {
  let __styleThis__class = __styleThis_var_FancyButton2_4;
  let __styleThis__comp = (0,react.forwardRef)((__styleThis__props, __styleThis__ref) => {
    var _a;
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(FancyButton, __spreadProps(__spreadValues({}, __styleThis__props), { ref: __styleThis__ref, className: mergeStyles(__styleThis__class, __styleThis__props.className), style: __spreadValues({
      "--var1-1mjodu": (({ b }) => `${b}px`)(__spreadProps(__spreadValues({}, __styleThis__props.styleProps), {
        "props": __styleThis__props
      })),
      "--var2-spq7g9": (({ b }) => `${b}px`)(__spreadProps(__spreadValues({}, __styleThis__props.styleProps), {
        "props": __styleThis__props
      })),
      "--var3-wlmjop": (({ props }) => props.disabled ? "red" : "green")(__spreadProps(__spreadValues({}, __styleThis__props.styleProps), {
        "props": __styleThis__props
      }))
    }, (_a = __styleThis__props.style) != null ? _a : {}) }));
  });
  __styleThis__comp.toString = () => __styleThis__class;
  return __styleThis__comp;
})();
function Counter() {
  const [count, setCount] = (0,react.useState)(0);
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: Counter_CounterStyle, children: [
    count,
    /* @__PURE__ */ (0,jsx_runtime.jsx)(FancyButton2, { styleProps: {
      a: 8,
      b: 16
    }, onClick: () => setCount(count + 1), disabled: count >= 3, children: "count me" })
  ] });
}
const counterColor = (/* unused pure expression or super */ null && (exportedColorA));

;// ../../packages/webpack/style-this.atomic-program.js?filepath=..%2F..%2Fexamples%2Fwebpack%2Fsrc%2FMainComponent.tsx

const ContainerStyle = "ContainerStyle-3wxanc d-W_vHB flex-d-Fbcuz";
const colorStyle = "colorStyle-v856z4 bg-BX1ye c-JjnMJ";
const highlightStyle = "highlightStyle-s1ybc1 c-E_XTG";
const _GlobalMain = "_GlobalMain";

;// ./src/MainComponent.tsx






const MainComponent_ContainerStyle = ContainerStyle;
const MainComponent_colorStyle = colorStyle;
const MainComponent_highlightStyle = highlightStyle;
function Main() {
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: `${MainComponent_ContainerStyle} Global__Main`, children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(Counter, {}),
    "hello",
    /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { className: mergeStyles(MainComponent_colorStyle, MainComponent_highlightStyle), children: "world" })
  ] });
}
const MainComponent_GlobalMain = _GlobalMain;

;// ./src/App.tsx




function App() {
  return /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { className: "content-container", children: /* @__PURE__ */ (0,jsx_runtime.jsx)(Main, {}) });
}
/* harmony default export */ const src_App = (App);

;// ./src/main.tsx





(0,client.createRoot)(document.getElementById("app")).render(
  /* @__PURE__ */ (0,jsx_runtime.jsx)(react.StrictMode, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(src_App, {}) })
);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			792: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkexample_webpack"] = self["webpackChunkexample_webpack"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [96], () => (__webpack_require__(791)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;