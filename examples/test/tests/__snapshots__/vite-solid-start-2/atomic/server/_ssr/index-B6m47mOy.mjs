import { D as createSignal, L as splitProps, a as escape, d as ssrAttribute, f as ssrElement, j as mergeProps, p as ssrHydrationKey, u as ssr, x as createComponent } from "../_libs/solid-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/index-B6m47mOy.js
var CounterStyle$1 = "CounterStyle-ezk5qn DTauT GGmKq KyVot LVc4W TC2Nt W_LRO ib2Uw zDIGu something";
var __styleThis_var_FancyButton_6 = "FancyButton-diz892 T5iL9 kG3jH zDIGu";
var __styleThis_var_FancyButton2_4 = "FancyButton2-r4dezo AndGx";
var _tmpl$$1 = [
	"<div",
	"><!--$-->",
	"<!--/--><!--$-->",
	"<!--/--></div>"
];
var CounterStyle = CounterStyle$1;
var FancyButton = (() => {
	let FancyButton = __styleThis_var_FancyButton_6;
	let comp = (props) => {
		const [_, rest] = splitProps(props, ["styleProps", "style"]);
		return ssrElement("button", mergeProps(rest, {
			get ["class"]() {
				return props.class ? FancyButton + (" " + props.class) : FancyButton;
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
	let FancyButton2 = __styleThis_var_FancyButton2_4;
	let comp = (props) => {
		return createComponent(FancyButton, mergeProps(props, {
			get ["class"]() {
				return props.class ? FancyButton2 + (" " + props.class) : FancyButton2;
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
	return ssr(_tmpl$$1, ssrHydrationKey() + ssrAttribute("class", escape(CounterStyle, true), false), escape(count()), escape(createComponent(FancyButton2, {
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
var ContainerStyle$1 = "ContainerStyle-gpyfg1 F56Lh W_LRO";
var colorStyle$1 = "colorStyle-r01i7c JFbUm";
var _tmpl$ = [
	"<div",
	" class=\"",
	"\"><!--$-->",
	"<!--/-->hello<span",
	">world</span></div>"
];
var ContainerStyle = ContainerStyle$1;
var colorStyle = colorStyle$1;
function Main() {
	return ssr(_tmpl$, ssrHydrationKey(), `${escape(ContainerStyle, true)} Global__Main`, escape(createComponent(Counter, {})), ssrAttribute("class", escape(colorStyle, true), false));
}
var id$$ = "src/routes/index.tsx?pick=default&pick=$css&lang.tsx";
var index_tsx_pick_default_pick_$css_lang_default = Main;
//#endregion
export { index_tsx_pick_default_pick_$css_lang_default as default, id$$ };
