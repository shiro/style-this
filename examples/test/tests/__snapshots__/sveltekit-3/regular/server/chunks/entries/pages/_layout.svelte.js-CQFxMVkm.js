import { U as head, V as attr_class, W as clsx } from '../../chunks/server.js-C3XFd1wL.js';
import '../../chunks/dist.js-B6l_pEIu.js';
import '../../chunks/uneval.js-sOjdN_Ot.js';

//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	const AppWrapper = "AppWrapper-bwturc";
	let { children } = $$props;
	head("12qhfyh", $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Example</title>`);
		});
	});
	$$renderer.push(`<div id="app"${attr_class(clsx(AppWrapper))}><div class="content-container">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte.js-CQFxMVkm.js.map
