import { a as escape, p as ssrHydrationKey, u as ssr, x as createComponent } from "../_libs/solid-js.mjs";
import { L as Title } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/_build/assets/about-Dk4sqDDz.js
var _tmpl$ = [
	"<main",
	"><!--$-->",
	"<!--/--><h1>About</h1></main>"
];
var id$$ = "src/routes/about.tsx?pick=default&pick=$css&lang.tsx";
function About() {
	return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Title, { children: "About" })));
}
//#endregion
export { About as default, id$$ };
