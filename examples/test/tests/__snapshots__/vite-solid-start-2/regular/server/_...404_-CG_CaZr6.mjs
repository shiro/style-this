import { a as escape, p as ssrHydrationKey, u as ssr, x as createComponent } from "./_libs/solid-js.mjs";
import { I as HttpStatusCode, L as Title } from "./_ssr/ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/_...404_-CG_CaZr6.js
var _tmpl$ = [
	"<main",
	"><!--$-->",
	"<!--/--><!--$-->",
	"<!--/--><h1>Page Not Found</h1><p>Visit <a href=\"https://start.solidjs.com\" target=\"_blank\">start.solidjs.com</a> to learn how to build SolidStart apps.</p></main>"
];
var id$$ = "src/routes/[...404].tsx?pick=default&pick=$css&lang.tsx";
function NotFound() {
	return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, { children: "Not Found" })), escape(createComponent(HttpStatusCode, { code: 404 })));
}
//#endregion
export { NotFound as default, id$$ };
