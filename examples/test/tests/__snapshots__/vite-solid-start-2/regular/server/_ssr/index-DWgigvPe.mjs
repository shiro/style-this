import { D as createSignal, L as splitProps, a as escape, d as ssrAttribute, f as ssrElement, j as mergeProps, p as ssrHydrationKey, u as ssr, x as createComponent } from "../_libs/solid-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/index-DWgigvPe.js
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
new Set(Object.values(atomicPrefixes_default));
var prefixOf = (property) => atomicPrefixes_default[property];
new Map(Object.entries(atomicShorthands_default).map(([shorthand, longhands]) => [prefixOf(shorthand), longhands.split(" ").map(prefixOf)]));
/** Joins class lists, ignoring falsy values. */
var joinStyles = (...classes) => classes.filter(Boolean).join(" ");
/**
* Merges a styled component's CSS variables with the `style` prop, which wins on conflicts.
* The `style` prop may be a CSS string (e.g. in Solid), in which case CSS text is returned.
*/
var mergeInlineStyles = (vars, style$1) => {
	if (typeof style$1 !== "string") return {
		...vars,
		...style$1
	};
	let res = "";
	for (const [name, value] of Object.entries(vars)) if (value != null) res += `${name}:${value};`;
	return res + style$1;
};
var _tmpl$$1 = [
	"<div",
	" class=\"CounterStyle-ezk5qn something\"><!--$-->",
	"<!--/--><!--$-->",
	"<!--/--></div>"
];
var FancyButton = (() => {
	let __styleThis__class = "FancyButton-diz892";
	let __styleThis__comp = (__styleThis__props) => {
		const [, __styleThis__rest] = splitProps(__styleThis__props, ["styleProps", "style"]);
		return ssrElement("button", mergeProps(__styleThis__rest, {
			get ["class"]() {
				return joinStyles(__styleThis__class, __styleThis__props.class);
			},
			get style() {
				return mergeInlineStyles({ "--var1-azc1aj": (({ a }) => `${a}px`)({
					...__styleThis__props.styleProps,
					"props": __styleThis__props
				}) }, __styleThis__props.style);
			}
		}), void 0, true);
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
})();
var FancyButton2 = (() => {
	let __styleThis__class = "FancyButton2-r4dezo";
	let __styleThis__comp = (__styleThis__props) => {
		return createComponent(FancyButton, mergeProps(__styleThis__props, {
			get ["class"]() {
				return joinStyles(__styleThis__class, __styleThis__props.class);
			},
			get style() {
				return mergeInlineStyles({
					"--var1-nspajg": (({ b }) => `${b}px`)({
						...__styleThis__props.styleProps,
						"props": __styleThis__props
					}),
					"--var2-k1yf81": (({ b }) => `${b}px`)({
						...__styleThis__props.styleProps,
						"props": __styleThis__props
					}),
					"--var3-z85yv8": (({ props }) => props.disabled ? "red" : "green")({
						...__styleThis__props.styleProps,
						"props": __styleThis__props
					})
				}, __styleThis__props.style);
			}
		}));
	};
	__styleThis__comp.toString = () => __styleThis__class;
	return __styleThis__comp;
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
