import { U as head, V as attr_class, W as clsx } from '../../chunks/server.js-C3XFd1wL.js';
import '../../chunks/dist.js-DjZTlfNn.js';
import '../../chunks/uneval.js-sOjdN_Ot.js';

//#region \0virtual:style-this:src/routes/+layout.svelte.style-this.js
var AppWrapper = "AppWrapper-bwturc d-W_vHB flex-d-Fbcuz min-h-ZH67u";
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const AppWrapper$1 = AppWrapper;
		let { children } = $$props;
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Example</title>`);
			});
		});
		$$renderer.push(`<div id="app"${attr_class(clsx(AppWrapper$1))}><div class="content-container">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte.js-CxKL7m3h.js.map
