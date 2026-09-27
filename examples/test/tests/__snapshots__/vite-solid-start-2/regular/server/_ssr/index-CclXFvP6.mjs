import { D as createSignal, L as splitProps, a as escape, f as ssrElement, j as mergeProps, p as ssrHydrationKey, u as ssr, x as createComponent } from "../_libs/solid-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/index-CclXFvP6.js
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
	let FancyButton2 = "FancyButton2-r4dezo";
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
	" class=\"ContainerStyle-gpyfg1 global__Main\"><!--$-->",
	"<!--/-->hello<span class=\"colorStyle-r01i7c\">world</span></div>"
];
function Main() {
	return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Counter, {})));
}
var id$$ = "src/routes/index.tsx?pick=default&pick=$css&lang.tsx";
var index_tsx_pick_default_pick_$css_lang_default = Main;
//#endregion
export { index_tsx_pick_default_pick_$css_lang_default as default, id$$ };
