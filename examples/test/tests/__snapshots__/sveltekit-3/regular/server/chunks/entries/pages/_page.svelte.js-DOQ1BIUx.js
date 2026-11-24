import { V as attr_class, W as clsx, X as escape_html, Y as attr_style, Z as attr, _ as bind_props } from '../../chunks/server.js-C3XFd1wL.js';
import { j as joinStyles } from '../../chunks/dist.js-brYoV7mO.js';
import '../../chunks/uneval.js-sOjdN_Ot.js';

//#region src/lib/Counter.svelte
function Counter($$renderer, $$props) {
	const CounterStyle = "CounterStyle-gli3ol something";
	$$renderer.push(`<div${attr_class(clsx(CounterStyle))}>${escape_html(0)} <button${attr_class(clsx("ButtonStyle-6b8lyj"))}${attr_style(`background: green`)}${attr("disabled", false, true)}>count me</button></div>`);
	bind_props($$props, { CounterStyle });
}
//#endregion
//#region src/lib/Main.svelte
function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ContainerStyle = "ContainerStyle-pqrkhi";
		const colorStyle = "colorStyle-g5ab0p";
		const highlightStyle = "highlightStyle-afcpuv";
		$$renderer.push(`<div${attr_class(`${ContainerStyle} Global__Main`)}>`);
		Counter($$renderer, {});
		$$renderer.push(`<!----> hello <span${attr_class(clsx(joinStyles(colorStyle, highlightStyle)))}>world</span></div>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer) {
	Main($$renderer);
}

export { _page as default };
//# sourceMappingURL=_page.svelte.js-DOQ1BIUx.js.map
