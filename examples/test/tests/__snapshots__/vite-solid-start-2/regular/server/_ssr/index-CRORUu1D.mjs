import { D as createSignal, L as splitProps, a as escape, d as ssrAttribute, f as ssrElement, j as mergeProps, p as ssrHydrationKey, u as ssr, x as createComponent } from "../_libs/solid-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/index-CRORUu1D.js
new Set(Object.values({
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
}));
/** Joins class lists, ignoring falsy values. */
var joinStyles = (...classes) => classes.filter(Boolean).join(" ");
var _tmpl$$1 = [
	"<div",
	" class=\"CounterStyle-ezk5qn something\"><!--$-->",
	"<!--/--><!--$-->",
	"<!--/--></div>"
];
var FancyButton = (() => {
	let FancyButton = "FancyButton-diz892";
	let comp = (props) => {
		const [_, rest] = splitProps(props, ["styleProps", "style"]);
		return ssrElement("button", mergeProps(rest, {
			get ["class"]() {
				return joinStyles(FancyButton, props.class);
			},
			get style() {
				return {
					"--var1-mv4tyz": (({ a }) => `${a}px`)({
						...props.styleProps,
						"props": props
					}),
					...props.style ?? {}
				};
			}
		}), void 0, true);
	};
	comp.toString = () => FancyButton;
	return comp;
})();
var FancyButton2 = (() => {
	let FancyButton2 = "FancyButton2-r4dezo";
	let comp = (props) => {
		return createComponent(FancyButton, mergeProps(props, {
			get ["class"]() {
				return joinStyles(FancyButton2, props.class);
			},
			get style() {
				return {
					"--var1-78dub0": (({ b }) => `${b}px`)({
						...props.styleProps,
						"props": props
					}),
					"--var2-zcx2zg": (({ b }) => `${b}px`)({
						...props.styleProps,
						"props": props
					}),
					"--var3-sh6781": (({ props }) => props.disabled ? "red" : "green")({
						...props.styleProps,
						"props": props
					}),
					...props.style ?? {}
				};
			}
		}));
	};
	comp.toString = () => FancyButton2;
	return comp;
})();
function Counter() {
	const [count, setCount] = createSignal(0);
	return ssr(_tmpl$$1, ssrHydrationKey(), escape(count()), escape(createComponent(FancyButton2, {
		styleProps: {
			a: 8,
			b: 16
		},
		onClick: () => setCount(count() + 1),
		get disabled() {
			return count() >= 3;
		},
		children: "count me"
	})));
}
var _tmpl$ = [
	"<div",
	" class=\"ContainerStyle-3s1eng Global__Main\"><!--$-->",
	"<!--/-->hello<span",
	">world</span></div>"
];
var colorStyle = "colorStyle-gpyfg1";
var highlightStyle = "highlightStyle-r01i7c";
function Main() {
	return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Counter, {})), ssrAttribute("class", escape(joinStyles(colorStyle, highlightStyle), true), false));
}
var id$$ = "src/routes/index.tsx?pick=default&pick=$css&lang.tsx";
var index_tsx_pick_default_pick_$css_lang_default = Main;
//#endregion
export { index_tsx_pick_default_pick_$css_lang_default as default, id$$ };
