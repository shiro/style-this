/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 516:
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
	color: "c",
	font: "f",
	"font-family": "ff",
	"font-size": "fs",
	"font-weight": "fw",
	"font-style": "fst",
	"font-variant": "fv",
	"line-height": "lh",
	"letter-spacing": "ls",
	"word-spacing": "wsp",
	"text-align": "ta",
	"text-decoration": "td",
	"text-transform": "tt",
	"text-overflow": "to",
	"text-indent": "ti",
	"text-shadow": "tsh",
	"white-space": "ws",
	"word-break": "wb",
	"overflow-wrap": "ow",
	"vertical-align": "va",
	"list-style": "list",
	"list-style-type": "list-t",
	content: "cnt",
	background: "bg",
	"background-color": "bgc",
	"background-image": "bgi",
	"background-size": "bgs",
	"background-position": "bgp",
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
	"border-width": "bw",
	"border-style": "bs",
	"border-color": "bc",
	"border-radius": "r",
	"border-top-left-radius": "rtl",
	"border-top-right-radius": "rtr",
	"border-bottom-right-radius": "rbr",
	"border-bottom-left-radius": "rbl",
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
	animation: "animate",
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
const ATOMIC_HASH_LENGTH = 5;
const getAtomicPrefix = (className) => {
	const separatorIdx = className.length - ATOMIC_HASH_LENGTH - 1;
	if (separatorIdx < 1 || className[separatorIdx] !== "-") return;
	if (!/[a-zA-Z]/.test(className[separatorIdx + 1])) return;
	const prefix = className.slice(0, separatorIdx);
	return ATOMIC_PREFIXES.has(prefix) ? prefix : void 0;
};
/** Joins class lists, ignoring falsy values. */
const joinStyles = (...classes) => classes.filter(Boolean).join(" ");
/**
* Joins class lists, de-duping atomic classes of the same property (e.g. `m-xxxxx`), the last one wins.
* Other classes are only de-duped if identical. Falsy values are ignored.
* In non-atomic mode the transform replaces this with `joinStyles`.
*/
const mergeStyles = (...classes) => {
	const merged = /* @__PURE__ */ new Map();
	for (const classList of classes) {
		if (!classList) continue;
		for (const className of classList.split(/\s+/)) {
			if (!className) continue;
			const key = getAtomicPrefix(className) ?? className;
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

;// ../../packages/webpack/style-this.atomic-program.js?filepath=%2Fexamples%2Fwebpack%2Fsrc%2FCounter.tsx

const CounterStyle = "CounterStyle-zodu74 b-zDIGu bg-LVc4W d-W_LRO gap-TC2Nt items-ib2Uw m-afsNG p-DTauT r-KyVot something";
const __styleThis_var_FancyButton_6 = "FancyButton-otinw9 b-zDIGu bg-kG3jH p-ZQZLf r-T5iL9";
const __styleThis_var_FancyButton2_4 = "FancyButton2-wtirkd bg-xETRV cursor-AndGx m-LFmNO min-h-lkJSK";

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
  let FancyButton3 = __styleThis_var_FancyButton_6;
  let __styleThis__comp = (0,react.forwardRef)((__styleThis__props, __styleThis__ref) => {
    var _b;
    const _a = __styleThis__props, { styleProps: __styleThis__styleProps, style: __styleThis__style } = _a, __styleThis__rest = __objRest(_a, ["styleProps", "style"]);
    return /* @__PURE__ */ (0,jsx_runtime.jsx)("button", __spreadProps(__spreadValues({}, __styleThis__rest), { ref: __styleThis__ref, className: mergeStyles(FancyButton3, __styleThis__rest.className), style: __spreadValues({
      "--var1-enc92j": (({ a }) => `${a}px`)(__spreadProps(__spreadValues({}, __styleThis__props.styleProps), {
        "props": __styleThis__props
      }))
    }, (_b = __styleThis__props.style) != null ? _b : {}) }));
  });
  __styleThis__comp.toString = () => FancyButton3;
  return __styleThis__comp;
})();
const FancyButton2 = (() => {
  let FancyButton22 = __styleThis_var_FancyButton2_4;
  let __styleThis__comp = (0,react.forwardRef)((__styleThis__props, __styleThis__ref) => {
    var _a;
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(FancyButton, __spreadProps(__spreadValues({}, __styleThis__props), { ref: __styleThis__ref, className: mergeStyles(FancyButton22, __styleThis__props.className), style: __spreadValues({
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
  __styleThis__comp.toString = () => FancyButton22;
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

;// ../../packages/webpack/style-this.atomic-program.js?filepath=%2Fexamples%2Fwebpack%2Fsrc%2FMainComponent.tsx

const ContainerStyle = "ContainerStyle-3wxanc d-W_LRO flex-d-F56Lh";
const colorStyle = "colorStyle-v856z4 bg-BZ0hD c-JFbUm";
const highlightStyle = "highlightStyle-s1ybc1 c-E_Zrl";
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [96], () => (__webpack_require__(516)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;