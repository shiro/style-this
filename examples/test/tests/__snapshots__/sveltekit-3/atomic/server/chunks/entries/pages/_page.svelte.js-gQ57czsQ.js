import { V as attr_class, W as clsx, X as escape_html, Y as attr_style, Z as attr, _ as bind_props } from '../../chunks/server.js-C3XFd1wL.js';
import { m as mergeStyles } from '../../chunks/dist.js-V7OIv-NI.js';
import '../../chunks/uneval.js-sOjdN_Ot.js';

//#region \0virtual:style-this:src/lib/Counter.svelte.style-this.js
var CounterStyle = "CounterStyle-gli3ol b-ZeplZ bg-LPp8Q d-W_vHB gap-Td5yX items-Im4M1 m-GlJsR p-DLlYK r-K5PNW something";
var ButtonStyle = "ButtonStyle-6b8lyj b-ZeplZ cursor-ALqk3 p-TuZme r-TbAuj";
//#endregion
//#region src/lib/Counter.svelte
function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const CounterStyle$1 = CounterStyle;
		const ButtonStyle$1 = ButtonStyle;
		$$renderer.push(`<div${attr_class(clsx(CounterStyle$1))}>${escape_html(0)} <button${attr_class(clsx(ButtonStyle$1))}${attr_style(`background: green`)}${attr("disabled", false, true)}>count me</button></div>`);
		bind_props($$props, { CounterStyle: CounterStyle$1 });
	});
}
//#endregion
//#region \0virtual:style-this:src/lib/Main.svelte.style-this.js
var ContainerStyle = "ContainerStyle-pqrkhi d-W_vHB flex-d-Fbcuz";
var colorStyle = "colorStyle-g5ab0p c-JjnMJ";
var highlightStyle = "highlightStyle-afcpuv c-E_XTG";
//#endregion
//#region src/lib/Main.svelte
function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ContainerStyle$1 = ContainerStyle;
		const colorStyle$1 = colorStyle;
		const highlightStyle$1 = highlightStyle;
		$$renderer.push(`<div${attr_class(`${ContainerStyle$1} Global__Main`)}>`);
		Counter($$renderer, {});
		$$renderer.push(`<!----> hello <span${attr_class(clsx(mergeStyles(colorStyle$1, highlightStyle$1)))}>world</span></div>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer) {
	Main($$renderer);
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-gQ57czsQ.js.map
