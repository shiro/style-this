import { A as lazy, B as useContext, D as createSignal, E as createRoot, F as runWithOwner, I as sharedConfig, M as on, N as onCleanup, O as createUniqueId, P as resetErrorBoundaries, R as startTransition, S as createContext, T as createRenderEffect, _ as Suspense, a as escape, b as children, c as renderToStream, d as ssrAttribute, f as ssrElement, g as Show, h as ErrorBoundary, i as NoHydration, j as mergeProps, k as getOwner, l as renderToString, m as useAssets, n as Hydration, o as getRequestEvent, p as ssrHydrationKey, r as HydrationScript, t as provideRequestEvent, u as ssr, v as batch, w as createMemo, x as createComponent, y as catchError, z as untrack } from "../_libs/solid-js.mjs";
import { PassThrough, Readable } from "node:stream";
//#region node_modules/.nitro/vite/services/ssr/index.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
var _UNC_REGEX = /^[/\\]{2}/;
var _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
var _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
var normalize = function(path) {
	if (path.length === 0) return ".";
	path = normalizeWindowsPath(path);
	const isUNCPath = path.match(_UNC_REGEX);
	const isPathAbsolute = isAbsolute(path);
	const trailingSeparator = path[path.length - 1] === "/";
	path = normalizeString(path, !isPathAbsolute);
	if (path.length === 0) {
		if (isPathAbsolute) return "/";
		return trailingSeparator ? "./" : ".";
	}
	if (trailingSeparator) path += "/";
	if (_DRIVE_LETTER_RE.test(path)) path += "/";
	if (isUNCPath) {
		if (!isPathAbsolute) return `//./${path}`;
		return `//${path}`;
	}
	return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};
var join = function(...segments) {
	let path = "";
	for (const seg of segments) {
		if (!seg) continue;
		if (path.length > 0) {
			const pathTrailing = path[path.length - 1] === "/";
			const segLeading = seg[0] === "/";
			if (pathTrailing && segLeading) path += seg.slice(1);
			else path += pathTrailing || segLeading ? seg : `/${seg}`;
		} else path += seg;
	}
	return normalize(path);
};
function normalizeString(path, allowAboveRoot) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let char = null;
	for (let index = 0; index <= path.length; ++index) {
		if (index < path.length) char = path[index];
		else if (char === "/") break;
		else char = "/";
		if (char === "/") {
			if (lastSlash === index - 1 || dots === 1);
			else if (dots === 2) {
				if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf("/");
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
						}
						lastSlash = index;
						dots = 0;
						continue;
					} else if (res.length > 0) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = index;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					res += res.length > 0 ? "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += `/${path.slice(lastSlash + 1, index)}`;
				else res = path.slice(lastSlash + 1, index);
				lastSegmentLength = index - lastSlash - 1;
			}
			lastSlash = index;
			dots = 0;
		} else if (char === "." && dots !== -1) ++dots;
		else dots = -1;
	}
	return res;
}
var isAbsolute = function(p) {
	return _IS_ABSOLUTE_RE.test(p);
};
var clientViteManifest = {
	"_HttpStatusCode-BCcOJBVz.js": {
		"file": "_build/assets/HttpStatusCode-BCcOJBVz.js",
		"name": "HttpStatusCode",
		"imports": ["_web-lT-EAg3V.js"]
	},
	"_dist-CPkBsN0R.js": {
		"file": "_build/assets/dist-CPkBsN0R.js",
		"name": "dist",
		"imports": ["_web-lT-EAg3V.js"]
	},
	"_web-lT-EAg3V.js": {
		"file": "_build/assets/web-lT-EAg3V.js",
		"name": "web"
	},
	"src/entry-client.tsx": {
		"file": "_build/assets/entry-client-B2WY2skw.js",
		"name": "entry-client",
		"src": "src/entry-client.tsx",
		"isEntry": true,
		"imports": [
			"_web-lT-EAg3V.js",
			"_dist-CPkBsN0R.js",
			"_HttpStatusCode-BCcOJBVz.js"
		],
		"dynamicImports": [
			"src/routes/[...404].tsx?pick=default&pick=$css&lang.tsx",
			"src/routes/about.tsx?pick=default&pick=$css&lang.tsx",
			"src/routes/index.tsx?pick=default&pick=$css&lang.tsx"
		],
		"css": ["_build/assets/entry-client-Chy68Y4K.css"]
	},
	"src/routes/[...404].tsx?pick=default&pick=$css&lang.tsx": {
		"file": "_build/assets/_...404_-DEBQc9Xd.js",
		"name": "_...404_",
		"src": "src/routes/[...404].tsx?pick=default&pick=$css&lang.tsx",
		"isEntry": true,
		"imports": [
			"_web-lT-EAg3V.js",
			"_dist-CPkBsN0R.js",
			"_HttpStatusCode-BCcOJBVz.js"
		]
	},
	"src/routes/about.tsx?pick=default&pick=$css&lang.tsx": {
		"file": "_build/assets/about-DEF-GuGf.js",
		"name": "about",
		"src": "src/routes/about.tsx?pick=default&pick=$css&lang.tsx",
		"isEntry": true,
		"imports": ["_web-lT-EAg3V.js", "_dist-CPkBsN0R.js"]
	},
	"src/routes/index.tsx?pick=default&pick=$css&lang.tsx": {
		"file": "_build/assets/index-DLlNsiG2.js",
		"name": "index",
		"src": "src/routes/index.tsx?pick=default&pick=$css&lang.tsx",
		"isEntry": true,
		"imports": ["_web-lT-EAg3V.js"],
		"css": ["_build/assets/index-DWw6TUJo.css"]
	}
};
function getSsrProdManifest() {
	const viteManifest = clientViteManifest;
	return {
		path(id) {
			if (id.startsWith("./")) id = id.slice(2);
			const viteManifestEntry = clientViteManifest[id];
			if (!viteManifestEntry) throw new Error(`No entry found in vite manifest for '${id}'`);
			return join("/", viteManifestEntry.file);
		},
		async getAssets(id) {
			if (id.startsWith("./")) id = id.slice(2);
			return createHtmlTagsForAssets(findAssetsInViteManifest(clientViteManifest, id));
		},
		async json() {
			const json = {};
			const entryKeys = Object.keys(viteManifest).filter((id) => viteManifest[id]?.isEntry || viteManifest[id]?.isDynamicEntry).map((id) => id);
			for (const entryKey of entryKeys) json[entryKey] = {
				output: join("/", viteManifest[entryKey].file),
				assets: await this.getAssets(entryKey)
			};
			return json;
		}
	};
}
function createHtmlTagsForAssets(assets) {
	return assets.filter((asset) => asset.endsWith(".css") || asset.endsWith(".js") || asset.endsWith(".ts") || asset.endsWith(".mjs")).map((asset) => ({
		tag: "link",
		attrs: {
			href: "/" + asset,
			key: asset,
			...asset.endsWith(".css") ? { rel: "stylesheet" } : { rel: "modulepreload" }
		}
	}));
}
var entryId = "./src/entry-client.tsx".slice(2);
var entryImports = void 0;
function findAssetsInViteManifest(manifest, id, assetMap = /* @__PURE__ */ new Map(), stack = []) {
	if (stack.includes(id)) return [];
	const cached = assetMap.get(id);
	if (cached) return cached;
	const chunk = manifest[id];
	if (!chunk) return [];
	if (!entryImports) entryImports = [entryId, ...manifest[entryId]?.imports ?? []];
	const excludeEntryImports = id !== entryId;
	const assets = chunk.css?.filter(Boolean) || [];
	if (chunk.imports) {
		stack.push(id);
		for (let i = 0, l = chunk.imports.length; i < l; i++) {
			const importId = chunk.imports[i];
			if (!importId || excludeEntryImports && entryImports.includes(importId)) continue;
			assets.push(...findAssetsInViteManifest(manifest, importId, assetMap, stack));
		}
		stack.pop();
	}
	assets.push(chunk.file);
	const all = Array.from(new Set(assets));
	assetMap.set(id, all);
	return all;
}
function getSsrManifest(target) {
	return getSsrProdManifest();
}
var _tmpl$$4 = " ";
var assetMap = {
	style: (props) => ssrElement("style", props.attrs, () => props.children, true),
	link: (props) => ssrElement("link", props.attrs, void 0, true),
	script: (props) => {
		return props.attrs.src ? ssrElement("script", mergeProps(() => props.attrs, { get id() {
			return props.key;
		} }), () => ssr(_tmpl$$4), true) : null;
	},
	noscript: (props) => ssrElement("noscript", props.attrs, () => escape(props.children), true)
};
function renderAsset(asset, nonce) {
	let { tag, attrs: { key, ...attrs } = { key: void 0 }, children } = asset;
	return assetMap[tag]({
		attrs: {
			...attrs,
			nonce
		},
		key,
		children
	});
}
var REGISTRY = Symbol("assetRegistry");
var NOOP = () => "";
var keyAttrs = [
	"href",
	"rel",
	"data-vite-dev-id"
];
var getEntity = (registry, asset) => {
	let key = asset.tag;
	for (const k of keyAttrs) {
		if (!(k in asset.attrs)) continue;
		key += `[${k}='${asset.attrs[k]}']`;
	}
	return registry[key] ??= {
		key,
		consumers: 0
	};
};
var useAssets$1 = (assets, nonce) => {
	if (!assets.length) return;
	const registry = getRequestEvent().locals[REGISTRY] ??= {};
	const ssrRequestAssets = sharedConfig.context?.assets;
	const cssKeys = [];
	for (const asset of assets) {
		const entity = getEntity(registry, asset);
		if (asset.tag === "link" && asset.attrs.rel === "stylesheet" || asset.tag === "style") cssKeys.push(entity.key);
		entity.consumers++;
		if (entity.consumers > 1) continue;
		useAssets(() => renderAsset(asset, nonce));
		entity.ssrIdx = ssrRequestAssets.length - 1;
	}
	onCleanup(() => {
		for (const key of cssKeys) {
			const entity = registry[key];
			entity.consumers--;
			if (entity.consumers != 0) continue;
			ssrRequestAssets.splice(entity.ssrIdx, 1, NOOP);
			delete registry[key];
		}
	});
};
var assetsById = {};
var getAssets = async (id) => {
	if (assetsById[id]) return assetsById[id];
	const assets = await getSsrManifest("client").getAssets(id);
	assetsById[id] = assets;
	return assets;
};
var withAssets = function(fn) {
	const wrapper = async () => {
		const mod = await fn();
		const id = mod.id$$;
		if (!id) return mod;
		if (!mod.default) {
			console.error(`Module ${id} does not export default`);
			return { default: () => [] };
		}
		const assets = await getAssets(id);
		if (!assets.length) return mod;
		return { default: (props) => {
			const { nonce } = getRequestEvent();
			useAssets$1(assets, nonce);
			return mod.default(props);
		} };
	};
	return wrapper;
};
var lazy$1 = (fn) => lazy(withAssets(fn));
var MetaContext = createContext();
var cascadingTags = ["title", "meta"];
var titleTagProperties = [];
var metaTagProperties = [
	"name",
	"http-equiv",
	"content",
	"charset",
	"media"
].concat(["property"]);
var getTagKey = (tag, properties) => {
	const tagProps = Object.fromEntries(Object.entries(tag.props).filter(([k]) => properties.includes(k)).sort());
	if (Object.hasOwn(tagProps, "name") || Object.hasOwn(tagProps, "property")) {
		tagProps.name = tagProps.name || tagProps.property;
		delete tagProps.property;
	}
	return tag.tag + JSON.stringify(tagProps);
};
function initServerProvider() {
	const tags = [];
	useAssets(() => ssr(renderTags(tags)));
	return {
		addTag(tagDesc) {
			if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
				const properties = tagDesc.tag === "title" ? titleTagProperties : metaTagProperties;
				const tagDescKey = getTagKey(tagDesc, properties);
				const index = tags.findIndex((prev) => prev.tag === tagDesc.tag && getTagKey(prev, properties) === tagDescKey);
				if (index !== -1) tags.splice(index, 1);
			}
			tags.push(tagDesc);
			return tags.length;
		},
		removeTag(tag, index) {}
	};
}
var MetaProvider = (props) => {
	const actions = initServerProvider();
	return createComponent(MetaContext.Provider, {
		value: actions,
		get children() {
			return props.children;
		}
	});
};
var MetaTag = (tag, props, setting) => {
	useHead({
		tag,
		props,
		setting,
		id: createUniqueId(),
		get name() {
			return props.name || props.property;
		}
	});
	return null;
};
function useHead(tagDesc) {
	const c = useContext(MetaContext);
	if (!c) throw new Error("<MetaProvider /> should be in the tree");
	createRenderEffect(() => {
		const index = c.addTag(tagDesc);
		onCleanup(() => c.removeTag(tagDesc, index));
	});
}
function renderTags(tags) {
	return tags.map((tag) => {
		const props = Object.keys(tag.props).map((k) => k === "children" ? "" : ` ${k}="${escape(tag.props[k], true)}"`).join("");
		let children = tag.props.children;
		if (Array.isArray(children)) children = children.join("");
		if (tag.setting?.close) return `<${tag.tag} data-sm="${tag.id}"${props}>${tag.setting?.escape ? escape(children) : children || ""}</${tag.tag}>`;
		return `<${tag.tag} data-sm="${tag.id}"${props}/>`;
	}).join("");
}
var Title = (props) => MetaTag("title", props, {
	escape: true,
	close: true
});
function createBeforeLeave() {
	let listeners = /* @__PURE__ */ new Set();
	function subscribe(listener) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}
	let ignore = false;
	function confirm(to, options) {
		if (ignore) return !(ignore = false);
		const e = {
			to,
			options,
			defaultPrevented: false,
			preventDefault: () => e.defaultPrevented = true
		};
		for (const l of listeners) l.listener({
			to,
			options,
			get defaultPrevented() {
				return e.defaultPrevented;
			},
			preventDefault: e.preventDefault,
			from: l.location,
			retry: (force) => {
				force && (ignore = true);
				l.navigate(to, {
					...options,
					resolve: false
				});
			}
		});
		return !e.defaultPrevented;
	}
	return {
		subscribe,
		confirm
	};
}
var hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
var trimPathRegex = /^\/+|(\/)\/+$/g;
var mockBase = "http://sr";
function normalizePath$1(path, omitSlash = false) {
	const s = path.replace(trimPathRegex, "$1");
	return s ? omitSlash || /^[?#]/.test(s) ? s : "/" + s : "";
}
function resolvePath(base, path, from) {
	if (hasSchemeRegex.test(path)) return;
	const basePath = normalizePath$1(base);
	const fromPath = from && normalizePath$1(from);
	let result = "";
	if (!fromPath || path.startsWith("/")) result = basePath;
	else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) result = basePath + fromPath;
	else result = fromPath;
	return (result || "/") + normalizePath$1(path, !result);
}
function joinPaths(from, to) {
	return normalizePath$1(from).replace(/\/*(\*.*)?$/g, "") + normalizePath$1(to);
}
function extractSearchParams(url) {
	const params = {};
	url.searchParams.forEach((value, key) => {
		if (key in params) if (Array.isArray(params[key])) params[key].push(value);
		else params[key] = [params[key], value];
		else params[key] = value;
	});
	return params;
}
function createMatcher$1(path, partial, matchFilters) {
	const [pattern, splat] = path.split("/*", 2);
	const segments = pattern.split("/").filter(Boolean);
	const len = segments.length;
	return (location) => {
		const locSegments = location.split("/");
		if (locSegments[0] === "") locSegments.shift();
		if (locSegments.length && locSegments[locSegments.length - 1] === "") locSegments.pop();
		if (locSegments.includes("")) return null;
		const lenDiff = locSegments.length - len;
		if (lenDiff < 0 || lenDiff > 0 && splat === void 0 && !partial) return null;
		const match = {
			path: len ? "" : "/",
			params: {}
		};
		const matchFilter = (s) => matchFilters === void 0 ? void 0 : matchFilters[s];
		for (let i = 0; i < len; i++) {
			const segment = segments[i];
			const dynamic = segment[0] === ":";
			const locSegment = dynamic ? locSegments[i] : locSegments[i].toLowerCase();
			const key = dynamic ? segment.slice(1) : segment.toLowerCase();
			if (dynamic && matchSegment(locSegment, matchFilter(key))) match.params[key] = locSegment;
			else if (dynamic || !matchSegment(locSegment, key)) return null;
			match.path += `/${locSegment}`;
		}
		if (splat) {
			const remainder = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
			if (matchSegment(remainder, matchFilter(splat))) match.params[splat] = remainder;
			else return null;
		}
		return match;
	};
}
function matchSegment(input, filter) {
	const isEqual = (s) => s === input;
	if (filter === void 0) return true;
	else if (typeof filter === "string") return isEqual(filter);
	else if (typeof filter === "function") return filter(input);
	else if (Array.isArray(filter)) return filter.some(isEqual);
	else if (filter instanceof RegExp) return filter.test(input);
	return false;
}
function scoreRoute(route) {
	const [pattern, splat] = route.pattern.split("/*", 2);
	const segments = pattern.split("/").filter(Boolean);
	return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === void 0 ? 0 : 1));
}
function createMemoObject(fn) {
	const map = /* @__PURE__ */ new Map();
	const owner = getOwner();
	return new Proxy({}, {
		get(_, property) {
			if (!map.has(property)) runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
			return map.get(property)();
		},
		getOwnPropertyDescriptor() {
			return {
				enumerable: true,
				configurable: true
			};
		},
		ownKeys() {
			return Reflect.ownKeys(fn());
		},
		has(_, property) {
			return property in fn();
		}
	});
}
function expandOptionals(pattern) {
	let match = /(\/?\:[^\/]+)\?/.exec(pattern);
	if (!match) return [pattern];
	let prefix = pattern.slice(0, match.index);
	let suffix = pattern.slice(match.index + match[0].length);
	const prefixes = [prefix, prefix += match[1]];
	while (match = /^(\/\:[^\/]+)\?/.exec(suffix)) {
		prefixes.push(prefix += match[1]);
		suffix = suffix.slice(match[0].length);
	}
	return expandOptionals(suffix).reduce((results, expansion) => [...results, ...prefixes.map((p) => p + expansion)], []);
}
var MAX_REDIRECTS = 100;
/** Consider this API opaque and internal. It is likely to change in the future. */
var RouterContextObj = createContext();
var RouteContextObj = createContext();
var encodeSegment = (s) => encodeURIComponent(s).replace(/%(2B|40|3A|24|26|2C|3B|3D)/g, (m) => decodeURIComponent(m));
function createRoutes$1(routeDef, base = "") {
	const { component, preload, load, children, info } = routeDef;
	const isLeaf = !children || Array.isArray(children) && !children.length;
	const shared = {
		key: routeDef,
		component,
		preload: preload || load,
		info
	};
	return asArray(routeDef.path).reduce((acc, originalPath) => {
		for (const expandedPath of expandOptionals(originalPath)) {
			const path = joinPaths(base, expandedPath);
			let pattern = isLeaf ? path : path.split("/*", 1)[0];
			pattern = pattern.split("/").map((s) => {
				return s.startsWith(":") || s.startsWith("*") ? s : encodeSegment(s);
			}).join("/");
			acc.push({
				...shared,
				originalPath,
				pattern,
				matcher: createMatcher$1(pattern, !isLeaf, routeDef.matchFilters)
			});
		}
		return acc;
	}, []);
}
function createBranch(routes, index = 0) {
	return {
		routes,
		score: scoreRoute(routes[routes.length - 1]) * 1e4 - index,
		matcher(location) {
			const matches = [];
			for (let i = routes.length - 1; i >= 0; i--) {
				const route = routes[i];
				const match = route.matcher(location);
				if (!match) return null;
				matches.unshift({
					...match,
					route
				});
			}
			return matches;
		}
	};
}
function asArray(value) {
	return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", stack = [], branches = []) {
	const routeDefs = asArray(routeDef);
	for (let i = 0, len = routeDefs.length; i < len; i++) {
		const def = routeDefs[i];
		if (def && typeof def === "object") {
			if (!def.hasOwnProperty("path")) def.path = "";
			const routes = createRoutes$1(def, base);
			for (const route of routes) {
				stack.push(route);
				const isEmptyArray = Array.isArray(def.children) && def.children.length === 0;
				if (def.children && !isEmptyArray) createBranches(def.children, route.pattern, stack, branches);
				else {
					const branch = createBranch([...stack], branches.length);
					branches.push(branch);
				}
				stack.pop();
			}
		}
	}
	return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
	for (let i = 0, len = branches.length; i < len; i++) {
		const match = branches[i].matcher(location);
		if (match) return match;
	}
	return [];
}
function createLocation(path, state, queryWrapper) {
	const origin = new URL(mockBase);
	const url = createMemo((prev) => {
		const path_ = path();
		try {
			return new URL(path_[0] === "/" ? mockBase + path_ : path_, origin);
		} catch (err) {
			console.error(`Invalid path ${path_}`);
			return prev;
		}
	}, origin, { equals: (a, b) => a.href === b.href });
	const pathname = createMemo(() => url().pathname);
	const search = createMemo(() => url().search, true);
	const hash = createMemo(() => url().hash);
	const key = () => "";
	const queryFn = on(search, () => extractSearchParams(url()));
	return {
		get pathname() {
			return pathname();
		},
		get search() {
			return search();
		},
		get hash() {
			return hash();
		},
		get state() {
			return state();
		},
		get key() {
			return key();
		},
		query: queryWrapper ? queryWrapper(queryFn) : createMemoObject(queryFn)
	};
}
var intent;
function getIntent() {
	return intent;
}
function createRouterContext(integration, branches, getContext, options = {}) {
	const { signal: [source, setSource], utils = {} } = integration;
	const parsePath = utils.parsePath || ((p) => p);
	const renderPath = utils.renderPath || ((p) => p);
	const beforeLeave = utils.beforeLeave || createBeforeLeave();
	const basePath = resolvePath("", options.base || "");
	if (basePath === void 0) throw new Error(`${basePath} is not a valid base path`);
	else if (basePath && !source().value) setSource({
		value: basePath,
		replace: true,
		scroll: false
	});
	const [isRouting, setIsRouting] = createSignal(false);
	let lastTransitionTarget;
	const transition = (newIntent, newTarget) => {
		if (newTarget.value === reference() && newTarget.state === state()) return;
		if (lastTransitionTarget === void 0) setIsRouting(true);
		intent = newIntent;
		lastTransitionTarget = newTarget;
		startTransition(() => {
			if (lastTransitionTarget !== newTarget) return;
			setReference(lastTransitionTarget.value);
			setState(lastTransitionTarget.state);
			resetErrorBoundaries();
		}).finally(() => {
			if (lastTransitionTarget !== newTarget) return;
			batch(() => {
				intent = void 0;
				if (newIntent === "navigate") navigateEnd(lastTransitionTarget);
				setIsRouting(false);
				lastTransitionTarget = void 0;
			});
		});
	};
	const [reference, setReference] = createSignal(source().value);
	const [state, setState] = createSignal(source().state);
	const location = createLocation(reference, state, utils.queryWrapper);
	const referrers = [];
	const submissions = createSignal(initFromFlash());
	const matches = createMemo(() => {
		if (typeof options.transformUrl === "function") return getRouteMatches(branches(), options.transformUrl(location.pathname));
		return getRouteMatches(branches(), location.pathname);
	});
	const buildParams = () => {
		const m = matches();
		const params = {};
		for (let i = 0; i < m.length; i++) Object.assign(params, m[i].params);
		return params;
	};
	const params = utils.paramsWrapper ? utils.paramsWrapper(buildParams, branches) : createMemoObject(buildParams);
	const baseRoute = {
		pattern: basePath,
		path: () => basePath,
		outlet: () => null,
		resolvePath(to) {
			return resolvePath(basePath, to);
		}
	};
	createRenderEffect(on(source, (source) => transition("native", source), { defer: true }));
	return {
		base: baseRoute,
		location,
		params,
		isRouting,
		get pendingTarget() {
			return lastTransitionTarget;
		},
		renderPath,
		parsePath,
		navigatorFactory,
		matches,
		beforeLeave,
		preloadRoute,
		singleFlight: options.singleFlight === void 0 ? true : options.singleFlight,
		submissions
	};
	function navigateFromRoute(route, to, options) {
		untrack(() => {
			if (typeof to === "number") {
				if (!to) {} else if (utils.go) utils.go(to);
				else console.warn("Router integration does not support relative routing");
				return;
			}
			const queryOnly = !to || to[0] === "?";
			const { replace, resolve, scroll, state: nextState } = {
				replace: false,
				resolve: !queryOnly,
				scroll: true,
				...options
			};
			const resolvedTo = resolve ? route.resolvePath(to) : resolvePath(queryOnly && location.pathname || "", to);
			if (resolvedTo === void 0) throw new Error(`Path '${to}' is not a routable path`);
			else if (referrers.length >= MAX_REDIRECTS) throw new Error("Too many redirects");
			if (resolvedTo !== reference() || nextState !== state()) {
				const e = getRequestEvent();
				e && (e.response = {
					status: 302,
					headers: new Headers({ Location: resolvedTo })
				});
				setSource({
					value: resolvedTo,
					replace,
					scroll,
					state: nextState
				});
			}
		});
	}
	function navigatorFactory(route) {
		route = route || useContext(RouteContextObj) || baseRoute;
		return (to, options) => navigateFromRoute(route, to, options);
	}
	function navigateEnd(next) {
		const first = referrers[0];
		if (first) {
			setSource({
				...next,
				replace: first.replace,
				scroll: first.scroll
			});
			referrers.length = 0;
		}
	}
	function preloadRoute(url, preloadData) {
		const matches = getRouteMatches(branches(), url.pathname);
		const prevIntent = intent;
		intent = "preload";
		for (let match in matches) {
			const { route, params } = matches[match];
			route.component && route.component.preload && route.component.preload();
			const { preload } = route;
			preloadData && preload && runWithOwner(getContext(), () => preload({
				params,
				location: {
					pathname: url.pathname,
					search: url.search,
					hash: url.hash,
					query: extractSearchParams(url),
					state: null,
					key: ""
				},
				intent: "preload"
			}));
		}
		intent = prevIntent;
	}
	function initFromFlash() {
		const e = getRequestEvent();
		return e && e.router && e.router.submission ? [e.router.submission] : [];
	}
}
function createRouteContext(router, parent, outlet, match) {
	const { base, location, params } = router;
	const { pattern, component, preload } = match().route;
	const path = createMemo(() => match().path);
	component && component.preload && component.preload();
	const data = preload ? preload({
		params,
		location,
		intent: intent || "initial"
	}) : void 0;
	return {
		parent,
		pattern,
		path,
		outlet: () => component ? createComponent(component, {
			params,
			location,
			data,
			get children() {
				return outlet();
			}
		}) : outlet(),
		resolvePath(to) {
			return resolvePath(base.path(), to, path());
		}
	};
}
var createRouterComponent = (router) => (props) => {
	const { base } = props;
	const routeDefs = children(() => props.children);
	const branches = createMemo(() => createBranches(routeDefs(), props.base || ""));
	let context;
	const routerState = createRouterContext(router, branches, () => context, {
		base,
		singleFlight: props.singleFlight,
		transformUrl: props.transformUrl
	});
	router.create && router.create(routerState);
	return createComponent(RouterContextObj.Provider, {
		value: routerState,
		get children() {
			return createComponent(Root, {
				routerState,
				get root() {
					return props.root;
				},
				get preload() {
					return props.rootPreload || props.rootLoad;
				},
				get children() {
					return [(context = getOwner()) && null, createComponent(Routes, {
						routerState,
						get branches() {
							return branches();
						}
					})];
				}
			});
		}
	});
};
function Root(props) {
	const location = props.routerState.location;
	const params = props.routerState.params;
	const data = createMemo(() => props.preload && untrack(() => {
		props.preload({
			params,
			location,
			intent: getIntent() || "initial"
		});
	}));
	return createComponent(Show, {
		get when() {
			return props.root;
		},
		keyed: true,
		get fallback() {
			return props.children;
		},
		children: (Root) => createComponent(Root, {
			params,
			location,
			get data() {
				return data();
			},
			get children() {
				return props.children;
			}
		})
	});
}
function Routes(props) {
	{
		const e = getRequestEvent();
		if (e && e.router && e.router.dataOnly) {
			dataOnly(e, props.routerState, props.branches);
			return;
		}
		e && ((e.router || (e.router = {})).matches || (e.router.matches = props.routerState.matches().map(({ route, path, params }) => ({
			path: route.originalPath,
			pattern: route.pattern,
			match: path,
			params,
			info: route.info
		}))));
	}
	const disposers = [];
	let root;
	onCleanup(() => disposers.forEach((dispose) => dispose()));
	const routeStates = createMemo(on(props.routerState.matches, (nextMatches, prevMatches, prev) => {
		let equal = prevMatches && nextMatches.length === prevMatches.length;
		const next = [];
		for (let i = 0, len = nextMatches.length; i < len; i++) {
			const prevMatch = prevMatches && prevMatches[i];
			const nextMatch = nextMatches[i];
			if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) next[i] = prev[i];
			else {
				equal = false;
				if (disposers[i]) disposers[i]();
				createRoot((dispose) => {
					disposers[i] = dispose;
					next[i] = createRouteContext(props.routerState, next[i - 1] || props.routerState.base, createOutlet(() => routeStates()[i + 1]), () => {
						const routeMatches = props.routerState.matches();
						return routeMatches[i] ?? routeMatches[0];
					});
				});
			}
		}
		disposers.splice(nextMatches.length).forEach((dispose) => dispose());
		if (prev && equal) return prev;
		root = next[0];
		return next;
	}));
	return createOutlet(() => routeStates() && root)();
}
var createOutlet = (child) => {
	return () => createComponent(Show, {
		get when() {
			return child();
		},
		keyed: true,
		children: (child) => createComponent(RouteContextObj.Provider, {
			value: child,
			get children() {
				return child.outlet();
			}
		})
	});
};
function dataOnly(event, routerState, branches) {
	const url = new URL(event.request.url);
	const prevMatches = getRouteMatches(branches, new URL(event.router.previousUrl || event.request.url).pathname);
	const matches = getRouteMatches(branches, url.pathname);
	for (let match = 0; match < matches.length; match++) {
		if (!prevMatches[match] || matches[match].route !== prevMatches[match].route) event.router.dataOnly = true;
		const { route, params } = matches[match];
		route.preload && route.preload({
			params,
			location: routerState.location,
			intent: "preload"
		});
	}
}
function getPath(url) {
	const u = new URL(url);
	return u.pathname + u.search;
}
function StaticRouter(props) {
	let e;
	const obj = { value: props.url || (e = getRequestEvent()) && getPath(e.request.url) || "" };
	return createRouterComponent({ signal: [() => obj, (next) => Object.assign(obj, next)] })(props);
}
function Router(props) {
	return StaticRouter(props);
}
var solid_start_routes_default = [
	{
		"page": true,
		"$component": {
			"src": "src/routes/[...404].tsx?pick=default&pick=$css&lang.tsx",
			"build": () => import("../_...404_-CG_CaZr6.mjs"),
			"import": () => import("../_...404_-CG_CaZr6.mjs")
		},
		"path": "/*404"
	},
	{
		"page": true,
		"$component": {
			"src": "src/routes/about.tsx?pick=default&pick=$css&lang.tsx",
			"build": () => import("./about-Dk4sqDDz.mjs"),
			"import": () => import("./about-Dk4sqDDz.mjs")
		},
		"path": "/about"
	},
	{
		"page": true,
		"$component": {
			"src": "src/routes/index.tsx?pick=default&pick=$css&lang.tsx",
			"build": () => import("./index-CRORUu1D.mjs"),
			"import": () => import("./index-CRORUu1D.mjs")
		},
		"path": "/"
	}
];
var NODE_TYPES = {
	NORMAL: 0,
	WILDCARD: 1,
	PLACEHOLDER: 2
};
function createRouter$1(options = {}) {
	const ctx = {
		options,
		rootNode: createRadixNode(),
		staticRoutesMap: {}
	};
	const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
	if (options.routes) for (const path in options.routes) insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
	return {
		ctx,
		lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
		insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
		remove: (path) => remove(ctx, normalizeTrailingSlash(path))
	};
}
function lookup(ctx, path) {
	const staticPathNode = ctx.staticRoutesMap[path];
	if (staticPathNode) return staticPathNode.data;
	const sections = path.split("/");
	const params = {};
	let paramsFound = false;
	let wildcardNode = null;
	let node = ctx.rootNode;
	let wildCardParam = null;
	for (let i = 0; i < sections.length; i++) {
		const section = sections[i];
		if (node.wildcardChildNode !== null) {
			wildcardNode = node.wildcardChildNode;
			wildCardParam = sections.slice(i).join("/");
		}
		const nextNode = node.children.get(section);
		if (nextNode === void 0) {
			if (node && node.placeholderChildren.length > 1) {
				const remaining = sections.length - i;
				node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
			} else node = node.placeholderChildren[0] || null;
			if (!node) break;
			if (node.paramName) params[node.paramName] = section;
			paramsFound = true;
		} else node = nextNode;
	}
	if ((node === null || node.data === null) && wildcardNode !== null) {
		node = wildcardNode;
		params[node.paramName || "_"] = wildCardParam;
		paramsFound = true;
	}
	if (!node) return null;
	if (paramsFound) return {
		...node.data,
		params: paramsFound ? params : void 0
	};
	return node.data;
}
function insert(ctx, path, data) {
	let isStaticRoute = true;
	const sections = path.split("/");
	let node = ctx.rootNode;
	let _unnamedPlaceholderCtr = 0;
	const matchedNodes = [node];
	for (const section of sections) {
		let childNode;
		if (childNode = node.children.get(section)) node = childNode;
		else {
			const type = getNodeType(section);
			childNode = createRadixNode({
				type,
				parent: node
			});
			node.children.set(section, childNode);
			if (type === NODE_TYPES.PLACEHOLDER) {
				childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
				node.placeholderChildren.push(childNode);
				isStaticRoute = false;
			} else if (type === NODE_TYPES.WILDCARD) {
				node.wildcardChildNode = childNode;
				childNode.paramName = section.slice(3) || "_";
				isStaticRoute = false;
			}
			matchedNodes.push(childNode);
			node = childNode;
		}
	}
	for (const [depth, node2] of matchedNodes.entries()) node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
	node.data = data;
	if (isStaticRoute === true) ctx.staticRoutesMap[path] = node;
	return node;
}
function remove(ctx, path) {
	let success = false;
	const sections = path.split("/");
	let node = ctx.rootNode;
	for (const section of sections) {
		node = node.children.get(section);
		if (!node) return success;
	}
	if (node.data) {
		const lastSection = sections.at(-1) || "";
		node.data = null;
		if (Object.keys(node.children).length === 0 && node.parent) {
			node.parent.children.delete(lastSection);
			node.parent.wildcardChildNode = null;
			node.parent.placeholderChildren = [];
		}
		success = true;
	}
	return success;
}
function createRadixNode(options = {}) {
	return {
		type: options.type || NODE_TYPES.NORMAL,
		maxDepth: 0,
		parent: options.parent || null,
		children: /* @__PURE__ */ new Map(),
		data: options.data || null,
		paramName: options.paramName || null,
		wildcardChildNode: null,
		placeholderChildren: []
	};
}
function getNodeType(str) {
	if (str.startsWith("**")) return NODE_TYPES.WILDCARD;
	if (str[0] === ":" || str === "*") return NODE_TYPES.PLACEHOLDER;
	return NODE_TYPES.NORMAL;
}
var pageRoutes = defineRoutes(solid_start_routes_default.filter((o) => o.page));
function defineRoutes(fileRoutes) {
	function processRoute(routes, route, id, full) {
		const parentRoute = Object.values(routes).find((o) => {
			return id.startsWith(o.id + "/");
		});
		if (!parentRoute) {
			routes.push({
				...route,
				id,
				path: id.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/")
			});
			return routes;
		}
		processRoute(parentRoute.children || (parentRoute.children = []), route, id.slice(parentRoute.id.length), full);
		return routes;
	}
	return fileRoutes.sort((a, b) => a.path.length - b.path.length).reduce((prevRoutes, route) => {
		return processRoute(prevRoutes, route, route.path, route.path);
	}, []);
}
var router = createRouter$1({ routes: solid_start_routes_default.reduce((memo, route) => {
	if (!containsHTTP(route)) return memo;
	const path = route.path.replace(/\([^)/]+\)/g, "").replace(/\/+/g, "/").replace(/\*([^/]*)/g, (_, m) => `**:${m}`).split("/").map((s) => s.startsWith(":") || s.startsWith("*") ? s : encodeURIComponent(s)).join("/");
	if (/:[^/]*\?/g.test(path)) throw new Error(`Optional parameters are not supported in API routes: ${path}`);
	if (memo[path]) throw new Error(`Duplicate API routes for "${path}" found at "${memo[path].route.path}" and "${route.path}"`);
	memo[path] = { route };
	return memo;
}, {}) });
function containsHTTP(route) {
	return route["$HEAD"] || route["$GET"] || route["$POST"] || route["$PUT"] || route["$PATCH"] || route["$DELETE"];
}
function matchAPIRoute(path, method) {
	const match = router.lookup(path);
	if (match && match.route) {
		const route = match.route;
		const handler = method === "HEAD" ? route.$HEAD || route.$GET : route[`$${method}`];
		if (handler === void 0) return;
		const isPage = route.page === true && route.$component !== void 0;
		return {
			handler,
			params: match.params,
			isPage
		};
	}
}
var components = {};
function createRoutes() {
	function createRoute(route) {
		const component = route.$component && (components[route.$component.src] ??= lazy$1(route.$component.import));
		return {
			...route,
			...route.$$route ? route.$$route.require().route : void 0,
			info: {
				...route.$$route ? route.$$route.require().route.info : {},
				filesystem: true
			},
			component,
			children: route.children ? route.children.map(createRoute) : void 0
		};
	}
	return pageRoutes.map(createRoute);
}
/**
*
* Read more: https://docs.solidjs.com/solid-start/reference/routing/file-routes
*/
var FileRoutes = () => getRequestEvent().routes;
var app_exports = /* @__PURE__ */ __exportAll({
	default: () => App$1,
	id$$: () => id$$
});
var _tmpl$$3 = [
	"<div",
	" class=\"content-container\">",
	"</div>"
];
function App$1() {
	return createComponent(Router, {
		root: (props) => createComponent(MetaProvider, { get children() {
			return [createComponent(Title, { children: "Example" }), ssr(_tmpl$$3, ssrHydrationKey(), escape(createComponent(Suspense, { get children() {
				return props.children;
			} })))];
		} }),
		get children() {
			return createComponent(FileRoutes, {});
		}
	});
}
createContext();
var fe = "tc";
`${fe}`;
`${fe}`;
`${fe}`;
`${fe}`;
function d(e) {
	return { [`${fe}-${e}`]: "" };
}
`${fe}`;
createContext();
d("accordion");
d("accordion-button");
d("accordion-header");
d("accordion-item");
d("accordion-panel");
createContext();
d("button");
createContext();
d("alert");
createContext();
createContext();
d("alert-dialog");
d("alert-dialog-description");
d("alert-dialog-overlay");
d("alert-dialog-panel");
d("alert-dialog-title");
createContext();
createContext();
d("checkbox");
d("checkbox-description");
d("checkbox-indicator");
d("checkbox-label");
createContext();
createContext();
createContext();
d("combobox");
d("combobox-input");
d("combobox-options");
d("combobox-option");
d("combobox-label");
d("command");
d("command-input");
d("command-options");
d("command-option");
d("command-label");
createContext();
createContext();
createContext();
d("command-bar");
d("command-bar-description");
d("command-bar-overlay");
d("command-bar-panel");
d("command-bar-title");
createContext();
d("context-menu");
d("context-menu-boundary");
d("context-menu-overlay");
d("context-menu-panel");
createContext();
d("dialog");
d("dialog-description");
d("dialog-overlay");
d("dialog-panel");
d("dialog-title");
createContext();
d("disclosure");
d("disclosure-button");
d("disclosure-panel");
createContext();
d("feed");
d("feed-article");
d("feed-article-description");
d("feed-article-label");
d("feed-content");
d("feed-label");
createContext();
createContext();
createContext();
d("listbox");
d("listbox-button");
d("listbox-label");
d("listbox-options");
d("listbox-option");
createContext();
createContext();
d("menu");
d("menu-item");
createContext();
d("popover");
d("popover-button");
d("popover-overlay");
d("popover-panel");
createContext();
createContext();
d("radio-group");
d("radio-group-description");
d("radio-group-label");
d("radio-group-option");
createContext();
d("select");
d("select-option");
createContext();
createContext();
d("tab-group");
d("tab-list");
d("tab");
d("tab-panel");
d("toast");
d("toaster");
createContext();
var Xe = class Xe {
	constructor() {
		this.queue = [];
		this.listeners = /* @__PURE__ */ new Set();
		this.toastID = 0;
		this.id = Xe.toasterID, Xe.toasterID += 1;
	}
	subscribe(t) {
		return this.listeners.add(t), () => {
			this.listeners.delete(t);
		};
	}
	notify() {
		let t = [...this.queue];
		for (let o of this.listeners.keys()) o(t);
	}
	create(t) {
		let o = `toast-${this.id}-[${this.toastID}`;
		return this.toastID += 1, this.queue.push({
			id: o,
			data: t
		}), this.notify(), o;
	}
	remove(t) {
		this.queue = this.queue.filter((o) => o.id !== t), this.notify();
	}
	clear() {
		this.queue = [], this.notify();
	}
	getQueue() {
		return this.queue;
	}
};
Xe.toasterID = 0;
createContext();
d("toggle");
d("toolbar");
createContext();
createContext();
createContext();
/**
*
* Read more: https://docs.solidjs.com/solid-start/reference/server/http-status-code
*/
var HttpStatusCode = (props) => {
	const event = getRequestEvent();
	event.response.status = props.code;
	event.response.statusText = props.text;
	onCleanup(() => !event.complete && (event.response.status = 200));
	return null;
};
/**
* References
* - https://compat-table.github.io/compat-table/es6/
* - MDN
*/
var Feature = /* @__PURE__ */ function(Feature) {
	Feature[Feature["AggregateError"] = 1] = "AggregateError";
	Feature[Feature["ArrowFunction"] = 2] = "ArrowFunction";
	Feature[Feature["ErrorPrototypeStack"] = 4] = "ErrorPrototypeStack";
	Feature[Feature["ObjectAssign"] = 8] = "ObjectAssign";
	Feature[Feature["BigIntTypedArray"] = 16] = "BigIntTypedArray";
	Feature[Feature["RegExp"] = 32] = "RegExp";
	Feature[Feature["Temporal"] = 64] = "Temporal";
	return Feature;
}({});
var SYM_ASYNC_ITERATOR = Symbol.asyncIterator;
var SYM_HAS_INSTANCE = Symbol.hasInstance;
var SYM_IS_CONCAT_SPREADABLE = Symbol.isConcatSpreadable;
var SYM_ITERATOR = Symbol.iterator;
var SYM_MATCH = Symbol.match;
var SYM_MATCH_ALL = Symbol.matchAll;
var SYM_REPLACE = Symbol.replace;
var SYM_SEARCH = Symbol.search;
var SYM_SPECIES = Symbol.species;
var SYM_SPLIT = Symbol.split;
var SYM_TO_PRIMITIVE = Symbol.toPrimitive;
var SYM_TO_STRING_TAG = Symbol.toStringTag;
var SYM_UNSCOPABLES = Symbol.unscopables;
var INV_SYMBOL_REF = {
	[SYM_ASYNC_ITERATOR]: 0,
	[SYM_HAS_INSTANCE]: 1,
	[SYM_IS_CONCAT_SPREADABLE]: 2,
	[SYM_ITERATOR]: 3,
	[SYM_MATCH]: 4,
	[SYM_MATCH_ALL]: 5,
	[SYM_REPLACE]: 6,
	[SYM_SEARCH]: 7,
	[SYM_SPECIES]: 8,
	[SYM_SPLIT]: 9,
	[SYM_TO_PRIMITIVE]: 10,
	[SYM_TO_STRING_TAG]: 11,
	[SYM_UNSCOPABLES]: 12
};
var SYMBOL_REF = {
	[0]: SYM_ASYNC_ITERATOR,
	[1]: SYM_HAS_INSTANCE,
	[2]: SYM_IS_CONCAT_SPREADABLE,
	[3]: SYM_ITERATOR,
	[4]: SYM_MATCH,
	[5]: SYM_MATCH_ALL,
	[6]: SYM_REPLACE,
	[7]: SYM_SEARCH,
	[8]: SYM_SPECIES,
	[9]: SYM_SPLIT,
	[10]: SYM_TO_PRIMITIVE,
	[11]: SYM_TO_STRING_TAG,
	[12]: SYM_UNSCOPABLES
};
var CONSTANT_VAL = {
	[2]: true,
	[3]: false,
	[1]: void 0,
	[0]: null,
	[4]: -0,
	[5]: Number.POSITIVE_INFINITY,
	[6]: Number.NEGATIVE_INFINITY,
	[7]: NaN
};
var ERROR_CONSTRUCTOR_STRING = {
	[0]: "Error",
	[1]: "EvalError",
	[2]: "RangeError",
	[3]: "ReferenceError",
	[4]: "SyntaxError",
	[5]: "TypeError",
	[6]: "URIError"
};
var ERROR_CONSTRUCTOR = {
	[0]: Error,
	[1]: EvalError,
	[2]: RangeError,
	[3]: ReferenceError,
	[4]: SyntaxError,
	[5]: TypeError,
	[6]: URIError
};
function createSerovalNode(t, i, s, c, m, p, e, a, f, b, o, l) {
	return {
		t,
		i,
		s,
		c,
		m,
		p,
		e,
		a,
		f,
		b,
		o,
		l
	};
}
function createConstantNode(value) {
	return createSerovalNode(2, void 0, value, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
var TRUE_NODE = /* @__PURE__ */ createConstantNode(2);
var FALSE_NODE = /* @__PURE__ */ createConstantNode(3);
var UNDEFINED_NODE = /* @__PURE__ */ createConstantNode(1);
var NULL_NODE = /* @__PURE__ */ createConstantNode(0);
var NEG_ZERO_NODE = /* @__PURE__ */ createConstantNode(4);
var INFINITY_NODE = /* @__PURE__ */ createConstantNode(5);
var NEG_INFINITY_NODE = /* @__PURE__ */ createConstantNode(6);
var NAN_NODE = /* @__PURE__ */ createConstantNode(7);
function serializeChar(str) {
	switch (str) {
		case "\"": return "\\\"";
		case "\\": return "\\\\";
		case "\n": return "\\n";
		case "\r": return "\\r";
		case "\b": return "\\b";
		case "	": return "\\t";
		case "\f": return "\\f";
		case "<": return "\\x3C";
		case "\u2028": return "\\u2028";
		case "\u2029": return "\\u2029";
		default: return;
	}
}
function serializeString(str) {
	let result = "";
	let lastPos = 0;
	let replacement;
	for (let i = 0, len = str.length; i < len; i++) {
		replacement = serializeChar(str[i]);
		if (replacement) {
			result += str.slice(lastPos, i) + replacement;
			lastPos = i + 1;
		}
	}
	if (lastPos === 0) result = str;
	else result += str.slice(lastPos);
	return result;
}
function deserializeReplacer(str) {
	switch (str) {
		case "\\\\": return "\\";
		case "\\\"": return "\"";
		case "\\n": return "\n";
		case "\\r": return "\r";
		case "\\b": return "\b";
		case "\\t": return "	";
		case "\\f": return "\f";
		case "\\x3C": return "<";
		case "\\u2028": return "\u2028";
		case "\\u2029": return "\u2029";
		default: return str;
	}
}
function deserializeString(str) {
	return str.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, deserializeReplacer);
}
var REFERENCES_KEY = "__SEROVAL_REFS__";
var REFERENCE = /* @__PURE__ */ new Map();
var INV_REFERENCE = /* @__PURE__ */ new Map();
function hasReferenceID(value) {
	return REFERENCE.has(value);
}
function hasReference(id) {
	return INV_REFERENCE.has(id);
}
function getReferenceID(value) {
	if (hasReferenceID(value)) return REFERENCE.get(value);
	throw new SerovalMissingReferenceError(value);
}
function getReference(id) {
	if (hasReference(id)) return INV_REFERENCE.get(id);
	throw new SerovalMissingReferenceForIdError(id);
}
if (typeof globalThis !== "undefined") Object.defineProperty(globalThis, REFERENCES_KEY, {
	value: INV_REFERENCE,
	configurable: true,
	writable: false,
	enumerable: false
});
else if (typeof window !== "undefined") Object.defineProperty(window, REFERENCES_KEY, {
	value: INV_REFERENCE,
	configurable: true,
	writable: false,
	enumerable: false
});
else if (typeof self !== "undefined") Object.defineProperty(self, REFERENCES_KEY, {
	value: INV_REFERENCE,
	configurable: true,
	writable: false,
	enumerable: false
});
else if (typeof global !== "undefined") Object.defineProperty(global, REFERENCES_KEY, {
	value: INV_REFERENCE,
	configurable: true,
	writable: false,
	enumerable: false
});
function getErrorConstructor(error) {
	if (error instanceof EvalError) return 1;
	if (error instanceof RangeError) return 2;
	if (error instanceof ReferenceError) return 3;
	if (error instanceof SyntaxError) return 4;
	if (error instanceof TypeError) return 5;
	if (error instanceof URIError) return 6;
	return 0;
}
function getInitialErrorOptions(error) {
	const construct = ERROR_CONSTRUCTOR_STRING[getErrorConstructor(error)];
	if (error.name !== construct) return { name: error.name };
	if (error.constructor.name !== construct) return { name: error.constructor.name };
	return {};
}
function getErrorOptions(error, features) {
	let options = getInitialErrorOptions(error);
	const names = Object.getOwnPropertyNames(error);
	for (let i = 0, len = names.length, name; i < len; i++) {
		name = names[i];
		if (name !== "name" && name !== "message") if (name === "stack") {
			if (features & 4) {
				options = options || {};
				options[name] = error[name];
			}
		} else {
			options = options || {};
			options[name] = error[name];
		}
	}
	return options;
}
function getObjectFlag(obj) {
	if (Object.isFrozen(obj)) return 3;
	if (Object.isSealed(obj)) return 2;
	if (Object.isExtensible(obj)) return 0;
	return 1;
}
function createNumberNode(value) {
	switch (value) {
		case Number.POSITIVE_INFINITY: return INFINITY_NODE;
		case Number.NEGATIVE_INFINITY: return NEG_INFINITY_NODE;
	}
	if (value !== value) return NAN_NODE;
	if (Object.is(value, -0)) return NEG_ZERO_NODE;
	return createSerovalNode(0, void 0, value, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createStringNode(value) {
	return createSerovalNode(1, void 0, serializeString(value), void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createBigIntNode(current) {
	return createSerovalNode(3, void 0, "" + current, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createIndexedValueNode(id) {
	return createSerovalNode(4, id, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createDateNode(id, current) {
	const timestamp = current.valueOf();
	return createSerovalNode(5, id, timestamp !== timestamp ? "" : current.toISOString(), void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createTemporalNode(id, type, current) {
	return createSerovalNode(36, id, current.toString(), type, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createRegExpNode(id, current) {
	return createSerovalNode(6, id, void 0, serializeString(current.source), current.flags, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createWKSymbolNode(id, current) {
	return createSerovalNode(17, id, INV_SYMBOL_REF[current], void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createReferenceNode(id, ref) {
	return createSerovalNode(18, id, serializeString(getReferenceID(ref)), void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createPluginNode(id, tag, value) {
	return createSerovalNode(25, id, value, serializeString(tag), void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createArrayNode(id, current, parsedItems) {
	return createSerovalNode(9, id, void 0, void 0, void 0, void 0, void 0, parsedItems, void 0, void 0, getObjectFlag(current), void 0);
}
function createBoxedNode(id, boxed) {
	return createSerovalNode(21, id, void 0, void 0, void 0, void 0, void 0, void 0, boxed, void 0, void 0, void 0);
}
function createTypedArrayNode(id, current, buffer) {
	return createSerovalNode(15, id, void 0, current.constructor.name, void 0, void 0, void 0, void 0, buffer, current.byteOffset, void 0, current.length);
}
function createBigIntTypedArrayNode(id, current, buffer) {
	return createSerovalNode(16, id, void 0, current.constructor.name, void 0, void 0, void 0, void 0, buffer, current.byteOffset, void 0, current.length);
}
function createDataViewNode(id, current, buffer) {
	return createSerovalNode(20, id, void 0, void 0, void 0, void 0, void 0, void 0, buffer, current.byteOffset, void 0, current.byteLength);
}
function createErrorNode(id, current, options) {
	return createSerovalNode(13, id, getErrorConstructor(current), void 0, serializeString(current.message), options, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createAggregateErrorNode(id, current, options) {
	return createSerovalNode(14, id, getErrorConstructor(current), void 0, serializeString(current.message), options, void 0, void 0, void 0, void 0, void 0, void 0);
}
function createSetNode(id, items) {
	return createSerovalNode(7, id, void 0, void 0, void 0, void 0, void 0, items, void 0, void 0, void 0, void 0);
}
function createIteratorFactoryInstanceNode(factory, items) {
	return createSerovalNode(28, void 0, void 0, void 0, void 0, void 0, void 0, [factory, items], void 0, void 0, void 0, void 0);
}
function createAsyncIteratorFactoryInstanceNode(factory, items) {
	return createSerovalNode(30, void 0, void 0, void 0, void 0, void 0, void 0, [factory, items], void 0, void 0, void 0, void 0);
}
function createStreamConstructorNode(id, factory, sequence) {
	return createSerovalNode(31, id, void 0, void 0, void 0, void 0, void 0, sequence, factory, void 0, void 0, void 0);
}
function createStreamNextNode(id, parsed) {
	return createSerovalNode(32, id, void 0, void 0, void 0, void 0, void 0, void 0, parsed, void 0, void 0, void 0);
}
function createStreamThrowNode(id, parsed) {
	return createSerovalNode(33, id, void 0, void 0, void 0, void 0, void 0, void 0, parsed, void 0, void 0, void 0);
}
function createStreamReturnNode(id, parsed) {
	return createSerovalNode(34, id, void 0, void 0, void 0, void 0, void 0, void 0, parsed, void 0, void 0, void 0);
}
function createSequenceNode(id, sequence, throwAt, doneAt) {
	return createSerovalNode(35, id, throwAt, void 0, void 0, void 0, void 0, sequence, void 0, void 0, void 0, doneAt);
}
var { toString: objectToString } = Object.prototype;
var STEP_ERROR_CODES = {
	parsing: 1,
	serialization: 2,
	deserialization: 3
};
function getErrorMessageProd(type) {
	return `Seroval Error (step: ${STEP_ERROR_CODES[type]})`;
}
var getErrorMessage = (type, cause) => getErrorMessageProd(type);
var SerovalError = class extends Error {
	constructor(type, cause) {
		super(getErrorMessage(type, cause));
		this.cause = cause;
	}
};
var SerovalParserError = class extends SerovalError {
	constructor(cause) {
		super("parsing", cause);
	}
};
var SerovalDeserializationError = class extends SerovalError {
	constructor(cause) {
		super("deserialization", cause);
	}
};
function getSpecificErrorMessage(code) {
	return `Seroval Error (specific: ${code})`;
}
var SerovalUnsupportedTypeError = class extends Error {
	constructor(value) {
		super(getSpecificErrorMessage(1));
		this.value = value;
	}
};
var SerovalUnsupportedNodeError = class extends Error {
	constructor(node) {
		super(getSpecificErrorMessage(2));
	}
};
var SerovalMissingPluginError = class extends Error {
	constructor(tag) {
		super(getSpecificErrorMessage(3));
	}
};
var SerovalMissingInstanceError = class extends Error {
	constructor(tag) {
		super(getSpecificErrorMessage(4));
	}
};
var SerovalMissingReferenceError = class extends Error {
	constructor(value) {
		super(getSpecificErrorMessage(5));
		this.value = value;
	}
};
var SerovalMissingReferenceForIdError = class extends Error {
	constructor(id) {
		super(getSpecificErrorMessage(6));
	}
};
var SerovalUnknownTypedArrayError = class extends Error {
	constructor(name) {
		super(getSpecificErrorMessage(7));
	}
};
var SerovalMalformedNodeError = class extends Error {
	constructor(node) {
		super(getSpecificErrorMessage(8));
	}
};
var SerovalDepthLimitError = class extends Error {
	constructor(limit) {
		super(getSpecificErrorMessage(9));
	}
};
/**
* An opaque reference allows hiding values from the serializer.
*/
var OpaqueReference = class {
	constructor(value, replacement) {
		this.value = value;
		this.replacement = replacement;
	}
};
var PROMISE_CONSTRUCTOR = () => {
	const resolver = {
		p: 0,
		s: 0,
		f: 0
	};
	resolver.p = new Promise((resolve, reject) => {
		resolver.s = resolve;
		resolver.f = reject;
	});
	return resolver;
};
var STREAM_CONSTRUCTOR = () => {
	const buffer = [];
	const listeners = [];
	let alive = true;
	let success = false;
	let count = 0;
	const internal = {
		flush(value, mode, x) {
			for (x = 0; x < count; x++) if (listeners[x]) listeners[x][mode](value);
		},
		up(listener, x, z, current) {
			for (x = 0, z = buffer.length; x < z; x++) {
				current = buffer[x];
				if (!alive && x === z - 1) listener[success ? "return" : "throw"](current);
				else listener.next(current);
			}
		},
		on(listener, temp) {
			if (alive) {
				temp = count++;
				listeners[temp] = listener;
			}
			internal.up(listener);
			return () => {
				if (alive) {
					listeners[temp] = listeners[count];
					listeners[count--] = void 0;
				}
			};
		}
	};
	return {
		__SEROVAL_STREAM__: true,
		on(listener) {
			return internal.on(listener);
		},
		next(value) {
			if (alive) {
				buffer.push(value);
				internal.flush(value, "next");
			}
		},
		throw(value) {
			if (alive) {
				buffer.push(value);
				internal.flush(value, "throw");
				alive = false;
				success = false;
				listeners.length = 0;
			}
		},
		return(value) {
			if (alive) {
				buffer.push(value);
				internal.flush(value, "return");
				alive = false;
				success = true;
				listeners.length = 0;
			}
		}
	};
};
var ITERATOR_CONSTRUCTOR = (symbol) => (sequence) => () => {
	let index = 0;
	const instance = {
		[symbol]() {
			return instance;
		},
		next() {
			if (index > sequence.d) return {
				done: true,
				value: void 0
			};
			const currentIndex = index++;
			const data = sequence.v[currentIndex];
			if (currentIndex === sequence.t) throw data;
			return {
				done: currentIndex === sequence.d,
				value: data
			};
		}
	};
	return instance;
};
var ASYNC_ITERATOR_CONSTRUCTOR = (symbol, createPromise) => (stream) => () => {
	let count = 0;
	let doneAt = -1;
	let isThrow = false;
	const buffer = [];
	const pending = [];
	const internal = { finalize(i = 0, len = pending.length) {
		for (; i < len; i++) pending[i].s({
			done: true,
			value: void 0
		});
	} };
	stream.on({
		next(value) {
			const temp = pending.shift();
			if (temp) temp.s({
				done: false,
				value
			});
			buffer.push(value);
		},
		throw(value) {
			const temp = pending.shift();
			if (temp) temp.f(value);
			internal.finalize();
			doneAt = buffer.length;
			isThrow = true;
			buffer.push(value);
		},
		return(value) {
			const temp = pending.shift();
			if (temp) temp.s({
				done: true,
				value
			});
			internal.finalize();
			doneAt = buffer.length;
			buffer.push(value);
		}
	});
	const instance = {
		[symbol]() {
			return instance;
		},
		next() {
			if (doneAt === -1) {
				const index = count++;
				if (index >= buffer.length) {
					const temp = createPromise();
					pending.push(temp);
					return temp.p;
				}
				return {
					done: false,
					value: buffer[index]
				};
			}
			if (count > doneAt) return {
				done: true,
				value: void 0
			};
			const index = count++;
			const value = buffer[index];
			if (index !== doneAt) return {
				done: false,
				value
			};
			if (isThrow) throw value;
			return {
				done: true,
				value
			};
		}
	};
	return instance;
};
var ARRAY_BUFFER_CONSTRUCTOR = (b64) => {
	const decoded = atob(b64);
	const length = decoded.length;
	const arr = new Uint8Array(length);
	for (let i = 0; i < length; i++) arr[i] = decoded.charCodeAt(i);
	return arr.buffer;
};
function isSequence(value) {
	return "__SEROVAL_SEQUENCE__" in value;
}
function createSequence(values, throwAt, doneAt) {
	return {
		__SEROVAL_SEQUENCE__: true,
		v: values,
		t: throwAt,
		d: doneAt
	};
}
function createSequenceFromIterable(source) {
	const values = [];
	let throwsAt = -1;
	let doneAt = -1;
	const iterator = source[SYM_ITERATOR]();
	while (true) try {
		const value = iterator.next();
		values.push(value.value);
		if (value.done) {
			doneAt = values.length - 1;
			break;
		}
	} catch (error) {
		throwsAt = values.length;
		values.push(error);
	}
	return createSequence(values, throwsAt, doneAt);
}
var createIterator = ITERATOR_CONSTRUCTOR(SYM_ITERATOR);
function sequenceToIterator(sequence) {
	return createIterator(sequence);
}
var ITERATOR = {};
var ASYNC_ITERATOR = {};
/**
* Placeholder references
*/
var SPECIAL_REFS = {
	[0]: {},
	[1]: {},
	[2]: {},
	[3]: {},
	[4]: {},
	[5]: {}
};
function isStream(value) {
	return "__SEROVAL_STREAM__" in value;
}
function createStream() {
	return STREAM_CONSTRUCTOR();
}
function createStreamFromAsyncIterable(iterable) {
	const stream = createStream();
	const iterator = iterable[SYM_ASYNC_ITERATOR]();
	async function push() {
		try {
			const value = await iterator.next();
			if (value.done) stream.return(value.value);
			else {
				stream.next(value.value);
				await push();
			}
		} catch (error) {
			stream.throw(error);
		}
	}
	push().catch(() => {});
	return stream;
}
var createAsyncIterable = ASYNC_ITERATOR_CONSTRUCTOR(SYM_ASYNC_ITERATOR, PROMISE_CONSTRUCTOR);
function streamToAsyncIterable(stream) {
	return createAsyncIterable(stream);
}
function createBaseParserContext(mode, options) {
	return {
		plugins: options.plugins,
		mode,
		marked: /* @__PURE__ */ new Set(),
		features: 127 ^ (options.disabledFeatures || 0),
		refs: options.refs || /* @__PURE__ */ new Map(),
		depthLimit: options.depthLimit || 1e3
	};
}
/**
* Ensures that the value (based on an identifier) has been visited by the parser.
* @param ctx
* @param id
*/
function markParserRef(ctx, id) {
	ctx.marked.add(id);
}
/**
* Creates an identifier for a value
* @param ctx
* @param current
*/
function createIndexForValue(ctx, current) {
	const id = ctx.refs.size;
	ctx.refs.set(current, id);
	return id;
}
function getNodeForIndexedValue(ctx, current) {
	const registeredId = ctx.refs.get(current);
	if (registeredId != null) {
		markParserRef(ctx, registeredId);
		return {
			type: 1,
			value: createIndexedValueNode(registeredId)
		};
	}
	return {
		type: 0,
		value: createIndexForValue(ctx, current)
	};
}
function getReferenceNode(ctx, current) {
	const indexed = getNodeForIndexedValue(ctx, current);
	if (indexed.type === 1) return indexed;
	if (hasReferenceID(current)) return {
		type: 2,
		value: createReferenceNode(indexed.value, current)
	};
	return indexed;
}
/**
* Parsing methods
*/
function parseWellKnownSymbol(ctx, current) {
	const ref = getReferenceNode(ctx, current);
	if (ref.type !== 0) return ref.value;
	if (current in INV_SYMBOL_REF) return createWKSymbolNode(ref.value, current);
	throw new SerovalUnsupportedTypeError(current);
}
function parseSpecialReference(ctx, ref) {
	const result = getNodeForIndexedValue(ctx, SPECIAL_REFS[ref]);
	if (result.type === 1) return result.value;
	return createSerovalNode(26, result.value, ref, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
}
function parseIteratorFactory(ctx) {
	const result = getNodeForIndexedValue(ctx, ITERATOR);
	if (result.type === 1) return result.value;
	return createSerovalNode(27, result.value, void 0, void 0, void 0, void 0, void 0, void 0, parseWellKnownSymbol(ctx, SYM_ITERATOR), void 0, void 0, void 0);
}
function parseAsyncIteratorFactory(ctx) {
	const result = getNodeForIndexedValue(ctx, ASYNC_ITERATOR);
	if (result.type === 1) return result.value;
	return createSerovalNode(29, result.value, void 0, void 0, void 0, void 0, void 0, [parseSpecialReference(ctx, 1), parseWellKnownSymbol(ctx, SYM_ASYNC_ITERATOR)], void 0, void 0, void 0, void 0);
}
function createObjectNode(id, current, empty, record) {
	return createSerovalNode(empty ? 11 : 10, id, void 0, void 0, void 0, record, void 0, void 0, void 0, void 0, getObjectFlag(current), void 0);
}
function createMapNode(ctx, id, k, v) {
	return createSerovalNode(8, id, void 0, void 0, void 0, void 0, {
		k,
		v
	}, void 0, parseSpecialReference(ctx, 0), void 0, void 0, void 0);
}
function createPromiseConstructorNode(ctx, id, resolver) {
	return createSerovalNode(22, id, resolver, void 0, void 0, void 0, void 0, void 0, parseSpecialReference(ctx, 1), void 0, void 0, void 0);
}
function createArrayBufferNode(ctx, id, current) {
	const bytes = new Uint8Array(current);
	let result = "";
	for (let i = 0, len = bytes.length; i < len; i++) result += String.fromCharCode(bytes[i]);
	return createSerovalNode(19, id, serializeString(btoa(result)), void 0, void 0, void 0, void 0, void 0, parseSpecialReference(ctx, 5), void 0, void 0, void 0);
}
function createPlugin(plugin) {
	return plugin;
}
function dedupePlugins(deduped, plugins) {
	for (let i = 0, len = plugins.length; i < len; i++) {
		const current = plugins[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupePlugins(deduped, current.extends);
		}
	}
}
function resolvePlugins(plugins) {
	if (plugins) {
		const deduped = /* @__PURE__ */ new Set();
		dedupePlugins(deduped, plugins);
		return [...deduped];
	}
}
function getTypedArrayConstructor(name) {
	switch (name) {
		case "Int8Array": return Int8Array;
		case "Int16Array": return Int16Array;
		case "Int32Array": return Int32Array;
		case "Uint8Array": return Uint8Array;
		case "Uint16Array": return Uint16Array;
		case "Uint32Array": return Uint32Array;
		case "Uint8ClampedArray": return Uint8ClampedArray;
		case "Float32Array": return Float32Array;
		case "Float64Array": return Float64Array;
		case "BigInt64Array": return BigInt64Array;
		case "BigUint64Array": return BigUint64Array;
		default: throw new SerovalUnknownTypedArrayError(name);
	}
}
function isValidKey(key) {
	switch (key) {
		case "constructor":
		case "__proto__":
		case "prototype":
		case "__defineGetter__":
		case "__defineSetter__":
		case "__lookupGetter__":
		case "__lookupSetter__": return false;
		default: return true;
	}
}
function isValidSymbol(symbol) {
	switch (symbol) {
		case SYM_ASYNC_ITERATOR:
		case SYM_IS_CONCAT_SPREADABLE:
		case SYM_TO_STRING_TAG:
		case SYM_ITERATOR: return true;
		default: return false;
	}
}
var MAX_BASE64_LENGTH = 1e6;
var MAX_BIGINT_LENGTH = 1e4;
var MAX_REGEXP_SOURCE_LENGTH = 2e4;
function applyObjectFlag(obj, flag) {
	switch (flag) {
		case 3: return Object.freeze(obj);
		case 1: return Object.preventExtensions(obj);
		case 2: return Object.seal(obj);
		default: return obj;
	}
}
var DEFAULT_DEPTH_LIMIT = 1e3;
function createBaseDeserializerContext(mode, options) {
	var _options$features;
	const refs = options.refs || /* @__PURE__ */ new Map();
	if (!("types" in refs)) Object.assign(refs, { types: /* @__PURE__ */ new Map() });
	return {
		mode,
		plugins: options.plugins,
		refs,
		features: (_options$features = options.features) !== null && _options$features !== void 0 ? _options$features : 127 ^ (options.disabledFeatures || 0),
		depthLimit: options.depthLimit || DEFAULT_DEPTH_LIMIT
	};
}
function createCrossDeserializerContext(options) {
	return {
		mode: 2,
		base: createBaseDeserializerContext(2, options),
		child: void 0
	};
}
var DeserializePluginContext = class {
	constructor(_p, depth) {
		this._p = _p;
		this.depth = depth;
	}
	deserialize(node) {
		return deserialize$1(this._p, this.depth, node);
	}
};
function guardIndexedValue(ctx, id) {
	if (id < 0 || !Number.isFinite(id) || !Number.isInteger(id)) throw new SerovalMalformedNodeError({
		t: 4,
		i: id
	});
	if (ctx.refs.has(id)) throw new Error("Conflicted ref id: " + id);
}
function assignIndexedValueVanilla(ctx, id, value) {
	guardIndexedValue(ctx.base, id);
	if (ctx.state.marked.has(id)) ctx.base.refs.set(id, value);
	return value;
}
function assignIndexedValueCross(ctx, id, value) {
	guardIndexedValue(ctx.base, id);
	ctx.base.refs.set(id, value);
	return value;
}
function assignIndexedValue$1(ctx, id, value) {
	return ctx.mode === 1 ? assignIndexedValueVanilla(ctx, id, value) : assignIndexedValueCross(ctx, id, value);
}
function deserializeKnownValue(node, record, key) {
	if (Object.hasOwn(record, key)) return record[key];
	throw new SerovalMalformedNodeError(node);
}
function deserializeReference(ctx, node) {
	return assignIndexedValue$1(ctx, node.i, getReference(deserializeString(node.s)));
}
function deserializeArray(ctx, depth, node) {
	const items = node.a;
	const len = items.length;
	const result = assignIndexedValue$1(ctx, node.i, new Array(len));
	for (let i = 0, item; i < len; i++) {
		item = items[i];
		if (item) result[i] = deserialize$1(ctx, depth, item);
	}
	applyObjectFlag(result, node.o);
	return result;
}
function assignStringProperty(object, key, value) {
	if (isValidKey(key)) object[key] = value;
	else Object.defineProperty(object, key, {
		value,
		configurable: true,
		enumerable: true,
		writable: true
	});
}
function assignProperty(ctx, depth, object, key, value) {
	if (typeof key === "string") assignStringProperty(object, deserializeString(key), deserialize$1(ctx, depth, value));
	else {
		const actual = deserialize$1(ctx, depth, key);
		switch (typeof actual) {
			case "string":
				assignStringProperty(object, actual, deserialize$1(ctx, depth, value));
				break;
			case "symbol":
				if (isValidSymbol(actual)) object[actual] = deserialize$1(ctx, depth, value);
				break;
			default: throw new SerovalMalformedNodeError(key);
		}
	}
}
function assignNodeType(ctx, id, type) {
	ctx.base.refs.types.set(id, type);
}
function validateNodeType(ctx, node, id, type) {
	if (ctx.base.refs.types.get(id) !== type) throw new SerovalMalformedNodeError(node);
}
function deserializeProperties(ctx, depth, node, result) {
	const keys = node.k;
	if (keys.length > 0) for (let i = 0, vals = node.v, len = keys.length; i < len; i++) assignProperty(ctx, depth, result, keys[i], vals[i]);
	return result;
}
function deserializeObject(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, node.t === 10 ? {} : Object.create(null));
	deserializeProperties(ctx, depth, node.p, result);
	applyObjectFlag(result, node.o);
	return result;
}
function deserializeDate(ctx, node) {
	return assignIndexedValue$1(ctx, node.i, new Date(node.s));
}
function deserializeTemporal(ctx, node) {
	if (!(ctx.base.features & 64)) throw new SerovalUnsupportedNodeError(node);
	let value;
	switch (node.c) {
		case 0:
			value = Temporal.Instant.from(node.s);
			break;
		case 1:
			value = Temporal.Duration.from(node.s);
			break;
		case 2:
			value = Temporal.PlainDate.from(node.s);
			break;
		case 3:
			value = Temporal.PlainDateTime.from(node.s);
			break;
		case 4:
			value = Temporal.PlainMonthDay.from(node.s);
			break;
		case 5:
			value = Temporal.PlainTime.from(node.s);
			break;
		case 6:
			value = Temporal.PlainYearMonth.from(node.s);
			break;
		case 7:
			value = Temporal.ZonedDateTime.from(node.s);
			break;
		default: throw new SerovalMalformedNodeError(node);
	}
	return assignIndexedValue$1(ctx, node.i, value);
}
function deserializeRegExp(ctx, node) {
	if (ctx.base.features & 32) {
		const source = deserializeString(node.c);
		if (source.length > MAX_REGEXP_SOURCE_LENGTH) throw new SerovalMalformedNodeError(node);
		return assignIndexedValue$1(ctx, node.i, new RegExp(source, node.m));
	}
	throw new SerovalUnsupportedNodeError(node);
}
function deserializeSet(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, /* @__PURE__ */ new Set());
	for (let i = 0, items = node.a, len = items.length; i < len; i++) result.add(deserialize$1(ctx, depth, items[i]));
	return result;
}
function deserializeMap(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, /* @__PURE__ */ new Map());
	for (let i = 0, keys = node.e.k, vals = node.e.v, len = keys.length; i < len; i++) result.set(deserialize$1(ctx, depth, keys[i]), deserialize$1(ctx, depth, vals[i]));
	return result;
}
function deserializeArrayBuffer(ctx, node) {
	if (node.s.length > MAX_BASE64_LENGTH) throw new SerovalMalformedNodeError(node);
	return assignIndexedValue$1(ctx, node.i, ARRAY_BUFFER_CONSTRUCTOR(deserializeString(node.s)));
}
function deserializeTypedArray(ctx, depth, node) {
	var _node$b;
	const construct = getTypedArrayConstructor(node.c);
	const source = deserialize$1(ctx, depth, node.f);
	const offset = (_node$b = node.b) !== null && _node$b !== void 0 ? _node$b : 0;
	if (offset < 0 || offset > source.byteLength) throw new SerovalMalformedNodeError(node);
	return assignIndexedValue$1(ctx, node.i, new construct(source, offset, node.l));
}
function deserializeDataView(ctx, depth, node) {
	var _node$b2;
	const source = deserialize$1(ctx, depth, node.f);
	const offset = (_node$b2 = node.b) !== null && _node$b2 !== void 0 ? _node$b2 : 0;
	if (offset < 0 || offset > source.byteLength) throw new SerovalMalformedNodeError(node);
	return assignIndexedValue$1(ctx, node.i, new DataView(source, offset, node.l));
}
function deserializeDictionary(ctx, depth, node, result) {
	if (node.p) {
		const fields = deserializeProperties(ctx, depth, node.p, {});
		Object.defineProperties(result, Object.getOwnPropertyDescriptors(fields));
	}
	return result;
}
function deserializeAggregateError(ctx, depth, node) {
	return deserializeDictionary(ctx, depth, node, assignIndexedValue$1(ctx, node.i, new AggregateError([], deserializeString(node.m))));
}
function deserializeError(ctx, depth, node) {
	const construct = deserializeKnownValue(node, ERROR_CONSTRUCTOR, node.s);
	return deserializeDictionary(ctx, depth, node, assignIndexedValue$1(ctx, node.i, new construct(deserializeString(node.m))));
}
function deserializePromise(ctx, depth, node) {
	const deferred = PROMISE_CONSTRUCTOR();
	const result = assignIndexedValue$1(ctx, node.i, deferred.p);
	const deserialized = deserialize$1(ctx, depth, node.f);
	if (node.s) deferred.s(deserialized);
	else deferred.f(deserialized);
	return result;
}
function deserializeBoxed(ctx, depth, node) {
	return assignIndexedValue$1(ctx, node.i, Object(deserialize$1(ctx, depth, node.f)));
}
function deserializePlugin(ctx, depth, node) {
	const currentPlugins = ctx.base.plugins;
	if (currentPlugins) {
		const tag = deserializeString(node.c);
		for (let i = 0, len = currentPlugins.length; i < len; i++) {
			const plugin = currentPlugins[i];
			if (plugin.tag === tag) return assignIndexedValue$1(ctx, node.i, plugin.deserialize(node.s, new DeserializePluginContext(ctx, depth), { id: node.i }));
		}
	}
	throw new SerovalMissingPluginError(node.c);
}
function deserializePromiseConstructor(ctx, node) {
	const value = assignIndexedValue$1(ctx, node.i, assignIndexedValue$1(ctx, node.s, PROMISE_CONSTRUCTOR()).p);
	assignNodeType(ctx, node.s, 22);
	return value;
}
function deserializePromiseResolve(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 22);
		deferred.s(deserialize$1(ctx, depth, node.a[1]));
		return;
	}
	throw new SerovalMissingInstanceError("Promise");
}
function deserializePromiseReject(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 22);
		deferred.f(deserialize$1(ctx, depth, node.a[1]));
		return;
	}
	throw new SerovalMissingInstanceError("Promise");
}
function deserializeIteratorFactoryInstance(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[0]);
	return sequenceToIterator(deserialize$1(ctx, depth, node.a[1]));
}
function deserializeAsyncIteratorFactoryInstance(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[0]);
	return streamToAsyncIterable(deserialize$1(ctx, depth, node.a[1]));
}
function deserializeStreamConstructor(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, createStream());
	assignNodeType(ctx, node.i, 31);
	const items = node.a;
	const len = items.length;
	if (len) for (let i = 0; i < len; i++) deserialize$1(ctx, depth, items[i]);
	return result;
}
function deserializeStreamNext(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 31);
		deferred.next(deserialize$1(ctx, depth, node.f));
		return;
	}
	throw new SerovalMissingInstanceError("Stream");
}
function deserializeStreamThrow(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 31);
		deferred.throw(deserialize$1(ctx, depth, node.f));
		return;
	}
	throw new SerovalMissingInstanceError("Stream");
}
function deserializeStreamReturn(ctx, depth, node) {
	const deferred = ctx.base.refs.get(node.i);
	if (deferred) {
		validateNodeType(ctx, node, node.i, 31);
		deferred.return(deserialize$1(ctx, depth, node.f));
		return;
	}
	throw new SerovalMissingInstanceError("Stream");
}
function deserializeIteratorFactory(ctx, depth, node) {
	deserialize$1(ctx, depth, node.f);
}
function deserializeAsyncIteratorFactory(ctx, depth, node) {
	deserialize$1(ctx, depth, node.a[1]);
}
function deserializeSequence(ctx, depth, node) {
	const result = assignIndexedValue$1(ctx, node.i, createSequence([], node.s, node.l));
	for (let i = 0, len = node.a.length; i < len; i++) result.v[i] = deserialize$1(ctx, depth, node.a[i]);
	return result;
}
function deserialize$1(ctx, depth, node) {
	if (depth > ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
	depth += 1;
	switch (node.t) {
		case 2: return deserializeKnownValue(node, CONSTANT_VAL, node.s);
		case 0: return Number(node.s);
		case 1: return deserializeString(String(node.s));
		case 3:
			if (String(node.s).length > MAX_BIGINT_LENGTH) throw new SerovalMalformedNodeError(node);
			return BigInt(node.s);
		case 4: return ctx.base.refs.get(node.i);
		case 18: return deserializeReference(ctx, node);
		case 9: return deserializeArray(ctx, depth, node);
		case 10:
		case 11: return deserializeObject(ctx, depth, node);
		case 5: return deserializeDate(ctx, node);
		case 6: return deserializeRegExp(ctx, node);
		case 7: return deserializeSet(ctx, depth, node);
		case 8: return deserializeMap(ctx, depth, node);
		case 19: return deserializeArrayBuffer(ctx, node);
		case 16:
		case 15: return deserializeTypedArray(ctx, depth, node);
		case 20: return deserializeDataView(ctx, depth, node);
		case 14: return deserializeAggregateError(ctx, depth, node);
		case 13: return deserializeError(ctx, depth, node);
		case 12: return deserializePromise(ctx, depth, node);
		case 17: return deserializeKnownValue(node, SYMBOL_REF, node.s);
		case 21: return deserializeBoxed(ctx, depth, node);
		case 25: return deserializePlugin(ctx, depth, node);
		case 22: return deserializePromiseConstructor(ctx, node);
		case 23: return deserializePromiseResolve(ctx, depth, node);
		case 24: return deserializePromiseReject(ctx, depth, node);
		case 28: return deserializeIteratorFactoryInstance(ctx, depth, node);
		case 30: return deserializeAsyncIteratorFactoryInstance(ctx, depth, node);
		case 31: return deserializeStreamConstructor(ctx, depth, node);
		case 32: return deserializeStreamNext(ctx, depth, node);
		case 33: return deserializeStreamThrow(ctx, depth, node);
		case 34: return deserializeStreamReturn(ctx, depth, node);
		case 27: return deserializeIteratorFactory(ctx, depth, node);
		case 29: return deserializeAsyncIteratorFactory(ctx, depth, node);
		case 35: return deserializeSequence(ctx, depth, node);
		case 36: return deserializeTemporal(ctx, node);
		default: throw new SerovalUnsupportedNodeError(node);
	}
}
function deserializeTop(ctx, node) {
	try {
		return deserialize$1(ctx, 0, node);
	} catch (error) {
		throw new SerovalDeserializationError(error);
	}
}
var SyncParsePluginContext = class {
	constructor(_p, depth) {
		this._p = _p;
		this.depth = depth;
	}
	parse(current) {
		return parseSOS(this._p, this.depth, current);
	}
};
var StreamParsePluginContext = class {
	constructor(_p, depth) {
		this._p = _p;
		this.depth = depth;
	}
	parse(current) {
		return parseSOS(this._p, this.depth, current);
	}
	parseWithError(current) {
		return parseWithError(this._p, this.depth, current);
	}
	isAlive() {
		return this._p.state.alive;
	}
	pushPendingState() {
		pushPendingState(this._p);
	}
	popPendingState() {
		popPendingState(this._p);
	}
	onParse(node) {
		onParse(this._p, node);
	}
	onError(error) {
		onError(this._p, error);
	}
	addCleanup(callback) {
		this._p.state.cleanups.push(callback);
	}
};
function createStreamParserState(options) {
	return {
		alive: true,
		pending: 0,
		initial: true,
		buffer: [],
		onParse: options.onParse,
		onError: options.onError,
		onDone: options.onDone,
		cleanups: []
	};
}
function createStreamParserContext(options) {
	return {
		type: 2,
		base: createBaseParserContext(2, options),
		state: createStreamParserState(options)
	};
}
function parseItems(ctx, depth, current) {
	const nodes = [];
	for (let i = 0, len = current.length; i < len; i++) if (i in current) nodes[i] = parseSOS(ctx, depth, current[i]);
	else nodes[i] = 0;
	return nodes;
}
function parseArray(ctx, depth, id, current) {
	return createArrayNode(id, current, parseItems(ctx, depth, current));
}
function parseProperties(ctx, depth, properties) {
	const entries = Object.entries(properties);
	const keyNodes = [];
	const valueNodes = [];
	for (let i = 0, len = entries.length; i < len; i++) {
		keyNodes.push(serializeString(entries[i][0]));
		valueNodes.push(parseSOS(ctx, depth, entries[i][1]));
	}
	if (SYM_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ITERATOR));
		valueNodes.push(createIteratorFactoryInstanceNode(parseIteratorFactory(ctx.base), parseSOS(ctx, depth, createSequenceFromIterable(properties))));
	}
	if (SYM_ASYNC_ITERATOR in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_ASYNC_ITERATOR));
		valueNodes.push(createAsyncIteratorFactoryInstanceNode(parseAsyncIteratorFactory(ctx.base), parseSOS(ctx, depth, ctx.type === 1 ? createStream() : createStreamFromAsyncIterable(properties))));
	}
	if (SYM_TO_STRING_TAG in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_TO_STRING_TAG));
		valueNodes.push(createStringNode(properties[SYM_TO_STRING_TAG]));
	}
	if (SYM_IS_CONCAT_SPREADABLE in properties) {
		keyNodes.push(parseWellKnownSymbol(ctx.base, SYM_IS_CONCAT_SPREADABLE));
		valueNodes.push(properties[SYM_IS_CONCAT_SPREADABLE] ? TRUE_NODE : FALSE_NODE);
	}
	return {
		k: keyNodes,
		v: valueNodes
	};
}
function parsePlainObject(ctx, depth, id, current, empty) {
	return createObjectNode(id, current, empty, parseProperties(ctx, depth, current));
}
function parseBoxed(ctx, depth, id, current) {
	return createBoxedNode(id, parseSOS(ctx, depth, current.valueOf()));
}
function parseTypedArray(ctx, depth, id, current) {
	return createTypedArrayNode(id, current, parseSOS(ctx, depth, current.buffer));
}
function parseBigIntTypedArray(ctx, depth, id, current) {
	return createBigIntTypedArrayNode(id, current, parseSOS(ctx, depth, current.buffer));
}
function parseDataView(ctx, depth, id, current) {
	return createDataViewNode(id, current, parseSOS(ctx, depth, current.buffer));
}
function parseError(ctx, depth, id, current) {
	const options = getErrorOptions(current, ctx.base.features);
	return createErrorNode(id, current, options ? parseProperties(ctx, depth, options) : void 0);
}
function parseAggregateError(ctx, depth, id, current) {
	const options = getErrorOptions(current, ctx.base.features);
	return createAggregateErrorNode(id, current, options ? parseProperties(ctx, depth, options) : void 0);
}
function parseMap(ctx, depth, id, current) {
	const keyNodes = [];
	const valueNodes = [];
	for (const [key, value] of current.entries()) {
		keyNodes.push(parseSOS(ctx, depth, key));
		valueNodes.push(parseSOS(ctx, depth, value));
	}
	return createMapNode(ctx.base, id, keyNodes, valueNodes);
}
function parseSet(ctx, depth, id, current) {
	const items = [];
	for (const item of current.keys()) items.push(parseSOS(ctx, depth, item));
	return createSetNode(id, items);
}
function parseStream(ctx, depth, id, current) {
	const result = createStreamConstructorNode(id, parseSpecialReference(ctx.base, 4), []);
	if (ctx.type === 1) return result;
	pushPendingState(ctx);
	current.on({
		next: (value) => {
			if (ctx.state.alive) {
				const parsed = parseWithError(ctx, depth, value);
				if (parsed) onParse(ctx, createStreamNextNode(id, parsed));
			}
		},
		throw: (value) => {
			if (ctx.state.alive) {
				const parsed = parseWithError(ctx, depth, value);
				if (parsed) onParse(ctx, createStreamThrowNode(id, parsed));
			}
			popPendingState(ctx);
		},
		return: (value) => {
			if (ctx.state.alive) {
				const parsed = parseWithError(ctx, depth, value);
				if (parsed) onParse(ctx, createStreamReturnNode(id, parsed));
			}
			popPendingState(ctx);
		}
	});
	return result;
}
function handlePromiseSuccess(id, depth, data) {
	if (this.state.alive) {
		const parsed = parseWithError(this, depth, data);
		if (parsed) onParse(this, createSerovalNode(23, id, void 0, void 0, void 0, void 0, void 0, [parseSpecialReference(this.base, 2), parsed], void 0, void 0, void 0, void 0));
		popPendingState(this);
	}
}
function handlePromiseFailure(id, depth, data) {
	if (this.state.alive) {
		const parsed = parseWithError(this, depth, data);
		if (parsed) onParse(this, createSerovalNode(24, id, void 0, void 0, void 0, void 0, void 0, [parseSpecialReference(this.base, 3), parsed], void 0, void 0, void 0, void 0));
	}
	popPendingState(this);
}
function parsePromise(ctx, depth, id, current) {
	const resolver = createIndexForValue(ctx.base, {});
	if (ctx.type === 2) {
		pushPendingState(ctx);
		current.then(handlePromiseSuccess.bind(ctx, resolver, depth), handlePromiseFailure.bind(ctx, resolver, depth));
	}
	return createPromiseConstructorNode(ctx.base, id, resolver);
}
function parsePluginSync(ctx, depth, id, current, currentPlugins) {
	for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.parse.sync && plugin.test(current)) return createPluginNode(id, plugin.tag, plugin.parse.sync(current, new SyncParsePluginContext(ctx, depth), { id }));
	}
}
function parsePluginStream(ctx, depth, id, current, currentPlugins) {
	for (let i = 0, len = currentPlugins.length; i < len; i++) {
		const plugin = currentPlugins[i];
		if (plugin.parse.stream && plugin.test(current)) return createPluginNode(id, plugin.tag, plugin.parse.stream(current, new StreamParsePluginContext(ctx, depth), { id }));
	}
}
function parsePlugin(ctx, depth, id, current) {
	const currentPlugins = ctx.base.plugins;
	if (currentPlugins) return ctx.type === 1 ? parsePluginSync(ctx, depth, id, current, currentPlugins) : parsePluginStream(ctx, depth, id, current, currentPlugins);
}
function parseSequence(ctx, depth, id, current) {
	const nodes = [];
	for (let i = 0, len = current.v.length; i < len; i++) nodes[i] = parseSOS(ctx, depth, current.v[i]);
	return createSequenceNode(id, nodes, current.t, current.d);
}
function parseObjectPhase2(ctx, depth, id, current, currentClass) {
	switch (currentClass) {
		case Object: return parsePlainObject(ctx, depth, id, current, false);
		case void 0: return parsePlainObject(ctx, depth, id, current, true);
		case Date: return createDateNode(id, current);
		case Error:
		case EvalError:
		case RangeError:
		case ReferenceError:
		case SyntaxError:
		case TypeError:
		case URIError: return parseError(ctx, depth, id, current);
		case Number:
		case Boolean:
		case String:
		case BigInt: return parseBoxed(ctx, depth, id, current);
		case ArrayBuffer: return createArrayBufferNode(ctx.base, id, current);
		case Int8Array:
		case Int16Array:
		case Int32Array:
		case Uint8Array:
		case Uint16Array:
		case Uint32Array:
		case Uint8ClampedArray:
		case Float32Array:
		case Float64Array: return parseTypedArray(ctx, depth, id, current);
		case DataView: return parseDataView(ctx, depth, id, current);
		case Map: return parseMap(ctx, depth, id, current);
		case Set: return parseSet(ctx, depth, id, current);
	}
	if (currentClass === Promise || current instanceof Promise) return parsePromise(ctx, depth, id, current);
	const currentFeatures = ctx.base.features;
	if (currentFeatures & 32 && currentClass === RegExp) return createRegExpNode(id, current);
	if (currentFeatures & 16) switch (currentClass) {
		case BigInt64Array:
		case BigUint64Array: return parseBigIntTypedArray(ctx, depth, id, current);
		default: break;
	}
	if (currentFeatures & 1 && typeof AggregateError !== "undefined" && (currentClass === AggregateError || current instanceof AggregateError)) return parseAggregateError(ctx, depth, id, current);
	if (currentFeatures & 64 && typeof Temporal !== "undefined") switch (currentClass) {
		case Temporal.Instant: return createTemporalNode(id, 0, current);
		case Temporal.Duration: return createTemporalNode(id, 1, current);
		case Temporal.PlainDate: return createTemporalNode(id, 2, current);
		case Temporal.PlainDateTime: return createTemporalNode(id, 3, current);
		case Temporal.PlainMonthDay: return createTemporalNode(id, 4, current);
		case Temporal.PlainTime: return createTemporalNode(id, 5, current);
		case Temporal.PlainYearMonth: return createTemporalNode(id, 6, current);
		case Temporal.ZonedDateTime: return createTemporalNode(id, 7, current);
		default: break;
	}
	if (current instanceof Error) return parseError(ctx, depth, id, current);
	if (SYM_ITERATOR in current || SYM_ASYNC_ITERATOR in current) return parsePlainObject(ctx, depth, id, current, !!currentClass);
	throw new SerovalUnsupportedTypeError(current);
}
function parseObject(ctx, depth, id, current) {
	if (Array.isArray(current)) return parseArray(ctx, depth, id, current);
	if (isStream(current)) return parseStream(ctx, depth, id, current);
	if (isSequence(current)) return parseSequence(ctx, depth, id, current);
	let currentClass = current.constructor;
	if (currentClass !== void 0 && typeof currentClass !== "function") {
		const proto = Object.getPrototypeOf(current);
		currentClass = proto === null ? void 0 : proto.constructor;
	}
	if (currentClass === OpaqueReference) return parseSOS(ctx, depth, current.replacement);
	const parsed = parsePlugin(ctx, depth, id, current);
	if (parsed) return parsed;
	return parseObjectPhase2(ctx, depth, id, current, currentClass);
}
function parseFunction(ctx, depth, current) {
	const ref = getReferenceNode(ctx.base, current);
	if (ref.type !== 0) return ref.value;
	const plugin = parsePlugin(ctx, depth, ref.value, current);
	if (plugin) return plugin;
	throw new SerovalUnsupportedTypeError(current);
}
function parseSOS(ctx, depth, current) {
	if (depth >= ctx.base.depthLimit) throw new SerovalDepthLimitError(ctx.base.depthLimit);
	switch (typeof current) {
		case "boolean": return current ? TRUE_NODE : FALSE_NODE;
		case "undefined": return UNDEFINED_NODE;
		case "string": return createStringNode(current);
		case "number": return createNumberNode(current);
		case "bigint": return createBigIntNode(current);
		case "object":
			if (current) {
				const ref = getReferenceNode(ctx.base, current);
				return ref.type === 0 ? parseObject(ctx, depth + 1, ref.value, current) : ref.value;
			}
			return NULL_NODE;
		case "symbol": return parseWellKnownSymbol(ctx.base, current);
		case "function": return parseFunction(ctx, depth, current);
		default: throw new SerovalUnsupportedTypeError(current);
	}
}
function onParse(ctx, node) {
	if (ctx.state.initial) ctx.state.buffer.push(node);
	else onParseInternal(ctx, node, false);
}
function onError(ctx, error) {
	if (ctx.state.onError) ctx.state.onError(error);
	else throw error instanceof SerovalParserError ? error : new SerovalParserError(error);
}
function onDone(ctx) {
	if (ctx.state.onDone) ctx.state.onDone();
	for (let i = 0, len = ctx.state.cleanups.length; i < len; i++) ctx.state.cleanups[i]();
}
function onParseInternal(ctx, node, initial) {
	try {
		ctx.state.onParse(node, initial);
	} catch (error) {
		onError(ctx, error);
	}
}
function pushPendingState(ctx) {
	ctx.state.pending++;
}
function popPendingState(ctx) {
	if (--ctx.state.pending <= 0) onDone(ctx);
}
function parseWithError(ctx, depth, current) {
	try {
		return parseSOS(ctx, depth, current);
	} catch (err) {
		onError(ctx, err);
		return;
	}
}
function startStreamParse(ctx, current) {
	const parsed = parseWithError(ctx, 0, current);
	if (parsed) {
		onParseInternal(ctx, parsed, true);
		ctx.state.initial = false;
		flushStreamParse(ctx, ctx.state);
		if (ctx.state.pending <= 0) destroyStreamParse(ctx);
	}
}
function flushStreamParse(ctx, state) {
	for (let i = 0, len = state.buffer.length; i < len; i++) onParseInternal(ctx, state.buffer[i], false);
}
function destroyStreamParse(ctx) {
	if (ctx.state.alive) {
		onDone(ctx);
		ctx.state.alive = false;
	}
}
function toCrossJSONStream(source, options) {
	const ctx = createStreamParserContext({
		plugins: resolvePlugins(options.plugins),
		refs: options.refs,
		disabledFeatures: options.disabledFeatures,
		depthLimit: options.depthLimit,
		onParse: options.onParse,
		onError: options.onError,
		onDone: options.onDone
	});
	startStreamParse(ctx, source);
	return destroyStreamParse.bind(null, ctx);
}
function fromCrossJSON(source, options) {
	return deserializeTop(createCrossDeserializerContext({
		plugins: resolvePlugins(options.plugins),
		refs: options.refs,
		features: options.features,
		disabledFeatures: options.disabledFeatures,
		depthLimit: options.depthLimit
	}), source);
}
var PROMISE_TO_ABORT_SIGNAL = (promise) => {
	const controller = new AbortController();
	const abort = controller.abort.bind(controller);
	promise.then(abort, abort);
	return controller;
};
function resolveAbortSignalResult(resolve) {
	resolve(this.reason);
}
function resolveAbortSignal(resolve) {
	this.addEventListener("abort", resolveAbortSignalResult.bind(this, resolve), { once: true });
}
function abortSignalToPromise(signal) {
	return new Promise(resolveAbortSignal.bind(signal));
}
var ABORT_CONTROLLER = {};
var AbortSignalPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/AbortSignal",
	extends: [/* @__PURE__ */ createPlugin({
		tag: "seroval-plugins/web/AbortControllerFactoryPlugin",
		test(value) {
			return value === ABORT_CONTROLLER;
		},
		parse: {
			sync() {
				return ABORT_CONTROLLER;
			},
			async async() {
				return await Promise.resolve(ABORT_CONTROLLER);
			},
			stream() {
				return ABORT_CONTROLLER;
			}
		},
		serialize() {
			return PROMISE_TO_ABORT_SIGNAL.toString();
		},
		deserialize() {
			return PROMISE_TO_ABORT_SIGNAL;
		}
	})],
	test(value) {
		if (typeof AbortSignal === "undefined") return false;
		return value instanceof AbortSignal;
	},
	parse: {
		sync(value, ctx) {
			if (value.aborted) return { reason: ctx.parse(value.reason) };
			return {};
		},
		async async(value, ctx) {
			if (value.aborted) return { reason: await ctx.parse(value.reason) };
			const result = await abortSignalToPromise(value);
			return { reason: await ctx.parse(result) };
		},
		stream(value, ctx) {
			if (value.aborted) return { reason: ctx.parse(value.reason) };
			const promise = abortSignalToPromise(value);
			return {
				factory: ctx.parse(ABORT_CONTROLLER),
				controller: ctx.parse(promise)
			};
		}
	},
	serialize(node, ctx) {
		if (node.reason) return "AbortSignal.abort(" + ctx.serialize(node.reason) + ")";
		if (node.controller && node.factory) return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.controller) + ").signal";
		return "(new AbortController).signal";
	},
	deserialize(node, ctx) {
		if (node.reason) return AbortSignal.abort(ctx.deserialize(node.reason));
		if (node.controller) return PROMISE_TO_ABORT_SIGNAL(ctx.deserialize(node.controller)).signal;
		return new AbortController().signal;
	}
});
function createCustomEventOptions(current) {
	return {
		detail: current.detail,
		bubbles: current.bubbles,
		cancelable: current.cancelable,
		composed: current.composed
	};
}
var CustomEventPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/CustomEvent",
	test(value) {
		if (typeof CustomEvent === "undefined") return false;
		return value instanceof CustomEvent;
	},
	parse: {
		sync(value, ctx) {
			return {
				type: ctx.parse(value.type),
				options: ctx.parse(createCustomEventOptions(value))
			};
		},
		async async(value, ctx) {
			return {
				type: await ctx.parse(value.type),
				options: await ctx.parse(createCustomEventOptions(value))
			};
		},
		stream(value, ctx) {
			return {
				type: ctx.parse(value.type),
				options: ctx.parse(createCustomEventOptions(value))
			};
		}
	},
	serialize(node, ctx) {
		return "new CustomEvent(" + ctx.serialize(node.type) + "," + ctx.serialize(node.options) + ")";
	},
	deserialize(node, ctx) {
		return new CustomEvent(ctx.deserialize(node.type), ctx.deserialize(node.options));
	}
});
var DOMExceptionPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/DOMException",
	test(value) {
		if (typeof DOMException === "undefined") return false;
		return value instanceof DOMException;
	},
	parse: {
		sync(value, ctx) {
			return {
				name: ctx.parse(value.name),
				message: ctx.parse(value.message)
			};
		},
		async async(value, ctx) {
			return {
				name: await ctx.parse(value.name),
				message: await ctx.parse(value.message)
			};
		},
		stream(value, ctx) {
			return {
				name: ctx.parse(value.name),
				message: ctx.parse(value.message)
			};
		}
	},
	serialize(node, ctx) {
		return "new DOMException(" + ctx.serialize(node.message) + "," + ctx.serialize(node.name) + ")";
	},
	deserialize(node, ctx) {
		return new DOMException(ctx.deserialize(node.message), ctx.deserialize(node.name));
	}
});
function createEventOptions(current) {
	return {
		bubbles: current.bubbles,
		cancelable: current.cancelable,
		composed: current.composed
	};
}
var EventPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/Event",
	test(value) {
		if (typeof Event === "undefined") return false;
		return value instanceof Event;
	},
	parse: {
		sync(value, ctx) {
			return {
				type: ctx.parse(value.type),
				options: ctx.parse(createEventOptions(value))
			};
		},
		async async(value, ctx) {
			return {
				type: await ctx.parse(value.type),
				options: await ctx.parse(createEventOptions(value))
			};
		},
		stream(value, ctx) {
			return {
				type: ctx.parse(value.type),
				options: ctx.parse(createEventOptions(value))
			};
		}
	},
	serialize(node, ctx) {
		return "new Event(" + ctx.serialize(node.type) + "," + ctx.serialize(node.options) + ")";
	},
	deserialize(node, ctx) {
		return new Event(ctx.deserialize(node.type), ctx.deserialize(node.options));
	}
});
var FilePlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/File",
	test(value) {
		if (typeof File === "undefined") return false;
		return value instanceof File;
	},
	parse: { async async(value, ctx) {
		return {
			name: await ctx.parse(value.name),
			options: await ctx.parse({
				type: value.type,
				lastModified: value.lastModified
			}),
			buffer: await ctx.parse(await value.arrayBuffer())
		};
	} },
	serialize(node, ctx) {
		return "new File([" + ctx.serialize(node.buffer) + "]," + ctx.serialize(node.name) + "," + ctx.serialize(node.options) + ")";
	},
	deserialize(node, ctx) {
		return new File([ctx.deserialize(node.buffer)], ctx.deserialize(node.name), ctx.deserialize(node.options));
	}
});
function convertFormData(instance) {
	const items = [];
	instance.forEach((value, key) => {
		items.push([key, value]);
	});
	return items;
}
var FORM_DATA_FACTORY = {};
var FORM_DATA_FACTORY_CONSTRUCTOR = (e, f = new FormData(), i = 0, s = e.length, t) => {
	for (; i < s; i++) {
		t = e[i];
		f.append(t[0], t[1]);
	}
	return f;
};
var FormDataPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/FormData",
	extends: [FilePlugin, /* @__PURE__ */ createPlugin({
		tag: "seroval-plugins/web/FormDataFactory",
		test(value) {
			return value === FORM_DATA_FACTORY;
		},
		parse: {
			sync() {
				return FORM_DATA_FACTORY;
			},
			async async() {
				return await Promise.resolve(FORM_DATA_FACTORY);
			},
			stream() {
				return FORM_DATA_FACTORY;
			}
		},
		serialize() {
			return FORM_DATA_FACTORY_CONSTRUCTOR.toString();
		},
		deserialize() {
			return FORM_DATA_FACTORY;
		}
	})],
	test(value) {
		if (typeof FormData === "undefined") return false;
		return value instanceof FormData;
	},
	parse: {
		sync(value, ctx) {
			return {
				factory: ctx.parse(FORM_DATA_FACTORY),
				entries: ctx.parse(convertFormData(value))
			};
		},
		async async(value, ctx) {
			return {
				factory: await ctx.parse(FORM_DATA_FACTORY),
				entries: await ctx.parse(convertFormData(value))
			};
		},
		stream(value, ctx) {
			return {
				factory: ctx.parse(FORM_DATA_FACTORY),
				entries: ctx.parse(convertFormData(value))
			};
		}
	},
	serialize(node, ctx) {
		return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.entries) + ")";
	},
	deserialize(node, ctx) {
		return FORM_DATA_FACTORY_CONSTRUCTOR(ctx.deserialize(node.entries));
	}
});
function convertHeaders(instance) {
	const items = [];
	instance.forEach((value, key) => {
		items.push([key, value]);
	});
	return items;
}
var HeadersPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/Headers",
	test(value) {
		if (typeof Headers === "undefined") return false;
		return value instanceof Headers;
	},
	parse: {
		sync(value, ctx) {
			return { value: ctx.parse(convertHeaders(value)) };
		},
		async async(value, ctx) {
			return { value: await ctx.parse(convertHeaders(value)) };
		},
		stream(value, ctx) {
			return { value: ctx.parse(convertHeaders(value)) };
		}
	},
	serialize(node, ctx) {
		return "new Headers(" + ctx.serialize(node.value) + ")";
	},
	deserialize(node, ctx) {
		return new Headers(ctx.deserialize(node.value));
	}
});
var READABLE_STREAM_FACTORY = {};
var READABLE_STREAM_FACTORY_CONSTRUCTOR = (stream) => new ReadableStream({ start(controller) {
	stream.on({
		next(value) {
			try {
				controller.enqueue(value);
			} catch (_error) {}
		},
		throw(value) {
			controller.error(value);
		},
		return() {
			try {
				controller.close();
			} catch (_error) {}
		}
	});
} });
var ReadableStreamFactoryPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/ReadableStreamFactory",
	test(value) {
		return value === READABLE_STREAM_FACTORY;
	},
	parse: {
		sync() {
			return READABLE_STREAM_FACTORY;
		},
		async async() {
			return await Promise.resolve(READABLE_STREAM_FACTORY);
		},
		stream() {
			return READABLE_STREAM_FACTORY;
		}
	},
	serialize() {
		return READABLE_STREAM_FACTORY_CONSTRUCTOR.toString();
	},
	deserialize() {
		return READABLE_STREAM_FACTORY;
	}
});
async function drainStream(stream, reader) {
	try {
		const result = await reader.read();
		if (result.done) {
			stream.return(result.value);
			reader.releaseLock();
		} else {
			stream.next(result.value);
			await drainStream(stream, reader);
		}
	} catch (error) {
		stream.throw(error);
	}
}
function cleanupStream(reader) {
	reader.cancel().catch(() => {});
	reader.releaseLock();
}
function toStream(value) {
	const stream = createStream();
	const reader = value.getReader();
	const cleanup = cleanupStream.bind(null, reader);
	drainStream(stream, reader).catch(cleanup);
	return [stream, cleanup];
}
var ReadableStreamPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval/plugins/web/ReadableStream",
	extends: [ReadableStreamFactoryPlugin],
	test(value) {
		if (typeof ReadableStream === "undefined") return false;
		return value instanceof ReadableStream;
	},
	parse: {
		sync(_value, ctx) {
			return {
				factory: ctx.parse(READABLE_STREAM_FACTORY),
				stream: ctx.parse(createStream())
			};
		},
		async async(value, ctx) {
			return {
				factory: await ctx.parse(READABLE_STREAM_FACTORY),
				stream: await ctx.parse(toStream(value)[0])
			};
		},
		stream(value, ctx) {
			const [stream, cleanup] = toStream(value);
			ctx.addCleanup(cleanup);
			return {
				factory: ctx.parse(READABLE_STREAM_FACTORY),
				stream: ctx.parse(stream)
			};
		}
	},
	serialize(node, ctx) {
		return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
	},
	deserialize(node, ctx) {
		return READABLE_STREAM_FACTORY_CONSTRUCTOR(ctx.deserialize(node.stream));
	}
});
function createRequestOptions(current, body) {
	return {
		body,
		cache: current.cache,
		credentials: current.credentials,
		headers: current.headers,
		integrity: current.integrity,
		keepalive: current.keepalive,
		method: current.method,
		mode: current.mode,
		redirect: current.redirect,
		referrer: current.referrer,
		referrerPolicy: current.referrerPolicy
	};
}
var RequestPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/Request",
	extends: [ReadableStreamPlugin, HeadersPlugin],
	test(value) {
		if (typeof Request === "undefined") return false;
		return value instanceof Request;
	},
	parse: {
		async async(value, ctx) {
			return {
				url: await ctx.parse(value.url),
				options: await ctx.parse(createRequestOptions(value, value.body && !value.bodyUsed ? await value.clone().arrayBuffer() : null))
			};
		},
		stream(value, ctx) {
			return {
				url: ctx.parse(value.url),
				options: ctx.parse(createRequestOptions(value, value.body && !value.bodyUsed ? value.clone().body : null))
			};
		}
	},
	serialize(node, ctx) {
		return "new Request(" + ctx.serialize(node.url) + "," + ctx.serialize(node.options) + ")";
	},
	deserialize(node, ctx) {
		return new Request(ctx.deserialize(node.url), ctx.deserialize(node.options));
	}
});
function createResponseOptions(current) {
	return {
		headers: current.headers,
		status: current.status,
		statusText: current.statusText
	};
}
var ResponsePlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/Response",
	extends: [ReadableStreamPlugin, HeadersPlugin],
	test(value) {
		if (typeof Response === "undefined") return false;
		return value instanceof Response;
	},
	parse: {
		async async(value, ctx) {
			return {
				body: await ctx.parse(value.body && !value.bodyUsed ? await value.clone().arrayBuffer() : null),
				options: await ctx.parse(createResponseOptions(value))
			};
		},
		stream(value, ctx) {
			return {
				body: ctx.parse(value.body && !value.bodyUsed ? value.clone().body : null),
				options: ctx.parse(createResponseOptions(value))
			};
		}
	},
	serialize(node, ctx) {
		return "new Response(" + ctx.serialize(node.body) + "," + ctx.serialize(node.options) + ")";
	},
	deserialize(node, ctx) {
		return new Response(ctx.deserialize(node.body), ctx.deserialize(node.options));
	}
});
var URLPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/URL",
	test(value) {
		if (typeof URL === "undefined") return false;
		return value instanceof URL;
	},
	parse: {
		sync(value, ctx) {
			return { value: ctx.parse(value.href) };
		},
		async async(value, ctx) {
			return { value: await ctx.parse(value.href) };
		},
		stream(value, ctx) {
			return { value: ctx.parse(value.href) };
		}
	},
	serialize(node, ctx) {
		return "new URL(" + ctx.serialize(node.value) + ")";
	},
	deserialize(node, ctx) {
		return new URL(ctx.deserialize(node.value));
	}
});
var URLSearchParamsPlugin = /* @__PURE__ */ createPlugin({
	tag: "seroval-plugins/web/URLSearchParams",
	test(value) {
		if (typeof URLSearchParams === "undefined") return false;
		return value instanceof URLSearchParams;
	},
	parse: {
		sync(value, ctx) {
			return { value: ctx.parse(value.toString()) };
		},
		async async(value, ctx) {
			return { value: await ctx.parse(value.toString()) };
		},
		stream(value, ctx) {
			return { value: ctx.parse(value.toString()) };
		}
	},
	serialize(node, ctx) {
		return "new URLSearchParams(" + ctx.serialize(node.value) + ")";
	},
	deserialize(node, ctx) {
		return new URLSearchParams(ctx.deserialize(node.value));
	}
});
var _solid_start_seroval_plugins_default = [];
/**
* Plugins from `serialization.plugins` are appended rather than prepended:
* seroval picks the first plugin whose `test()` passes, so the built-ins win
* and a loose user `test()` can't take over `Request`/`FormData`/`URL`.
*
* The same list has to be used on both ends of a server function, which is why
* this comes from a virtual module bundled into the client and the server
* rather than a runtime option.
*/
var PLUGINS = [...[
	AbortSignalPlugin,
	CustomEventPlugin,
	DOMExceptionPlugin,
	EventPlugin,
	FormDataPlugin,
	HeadersPlugin,
	ReadableStreamPlugin,
	RequestPlugin,
	ResponsePlugin,
	URLSearchParamsPlugin,
	URLPlugin
], ..._solid_start_seroval_plugins_default];
var MAX_SERIALIZATION_DEPTH_LIMIT = 64;
var DISABLED_FEATURES = Feature.RegExp;
/**
* An error thrown by a server function is serialized and rethrown on the
* client, and seroval includes `Error.prototype.stack` by default. In
* production that leaks server file paths, internal function names and the
* shape of the deployment to anyone who can trigger a throw, so strip it.
* Development keeps the stack: that's where it's actually useful, and the
* paths it exposes are the developer's own.
*
* Only applied when writing; parsing leaves `DISABLED_FEATURES` alone so an
* incoming payload that does carry a stack still deserializes.
*/
var SERIALIZE_DISABLED_FEATURES = DISABLED_FEATURES | Feature.ErrorPrototypeStack;
Feature.ErrorPrototypeStack;
/**
* Alexis:
*
* A "chunk" is a piece of data emitted by the streaming serializer.
* Each chunk is represented by a 32-bit value (encoded in hexadecimal),
* followed by the encoded string (8-bit representation). This format
* is important so we know how much of the chunk being streamed we
* are expecting before parsing the entire string data.
*
* This is sort of a bootleg "multipart/form-data" except it's bad at
* handling File/Blob LOL
*
* The format is as follows:
* ;0xFFFFFFFF;<string data>
*/
function createChunk(data) {
	const encodeData = new TextEncoder().encode(data);
	const bytes = encodeData.length;
	const baseHex = bytes.toString(16);
	const totalHex = "00000000".substring(0, 8 - baseHex.length) + baseHex;
	const head = new TextEncoder().encode(`;0x${totalHex};`);
	const chunk = new Uint8Array(12 + bytes);
	chunk.set(head);
	chunk.set(encodeData, 12);
	return chunk;
}
function serializeToJSONStream(value) {
	return new ReadableStream({ start(controller) {
		toCrossJSONStream(value, {
			disabledFeatures: SERIALIZE_DISABLED_FEATURES,
			depthLimit: MAX_SERIALIZATION_DEPTH_LIMIT,
			plugins: PLUGINS,
			onParse(node) {
				controller.enqueue(createChunk(JSON.stringify(node)));
			},
			onDone() {
				controller.close();
			},
			onError(error) {
				controller.error(error);
			}
		});
	} });
}
var SerovalChunkReader = class {
	reader;
	buffer;
	done;
	constructor(stream) {
		this.reader = stream.getReader();
		this.buffer = /* @__PURE__ */ new Uint8Array(0);
		this.done = false;
	}
	async readChunk() {
		const chunk = await this.reader.read();
		if (!chunk.done) {
			const newBuffer = new Uint8Array(this.buffer.length + chunk.value.length);
			newBuffer.set(this.buffer);
			newBuffer.set(chunk.value, this.buffer.length);
			this.buffer = newBuffer;
		} else this.done = true;
	}
	async next() {
		if (this.buffer.length === 0) {
			if (this.done) return {
				done: true,
				value: void 0
			};
			await this.readChunk();
			return await this.next();
		}
		const head = new TextDecoder().decode(this.buffer.subarray(1, 11));
		const bytes = Number.parseInt(head, 16);
		if (Number.isNaN(bytes)) throw new Error("Malformed server function stream.");
		while (bytes > this.buffer.length - 12) {
			if (this.done) throw new Error("Malformed server function stream.");
			await this.readChunk();
		}
		const partial = new TextDecoder().decode(this.buffer.subarray(12, 12 + bytes));
		this.buffer = this.buffer.subarray(12 + bytes);
		return {
			done: false,
			value: partial
		};
	}
	async drain(interpret) {
		while (true) {
			const result = await this.next();
			if (result.done) break;
			else interpret(result.value);
		}
	}
};
async function deserializeFromJSONString(json) {
	return await deserializeJSONStream(new Response(json));
}
async function deserializeJSONStream(response) {
	if (!response.body) throw new Error("missing body");
	const reader = new SerovalChunkReader(response.body);
	const result = await reader.next();
	if (!result.done) {
		const refs = /* @__PURE__ */ new Map();
		function interpretChunk(chunk) {
			return fromCrossJSON(JSON.parse(chunk), {
				refs,
				disabledFeatures: DISABLED_FEATURES,
				depthLimit: MAX_SERIALIZATION_DEPTH_LIMIT,
				plugins: PLUGINS
			});
		}
		reader.drain(interpretChunk);
		return interpretChunk(result.value);
	}
}
var BODY_FORMAT_KEY = "X-Start-Type";
var BODY_FORMAL_FILE = "__START__";
var BodyFormat;
(function(BodyFormat) {
	BodyFormat["Seroval"] = "0";
	BodyFormat["String"] = "1";
	BodyFormat["FormData"] = "2";
	BodyFormat["URLSearchParams"] = "3";
	BodyFormat["Blob"] = "4";
	BodyFormat["File"] = "5";
	BodyFormat["ArrayBuffer"] = "6";
	BodyFormat["Uint8Array"] = "7";
})(BodyFormat || (BodyFormat = {}));
function getHeadersAndBody(body) {
	switch (true) {
		case typeof body === "string": return {
			headers: {
				"Content-Type": "text/plain",
				[BODY_FORMAT_KEY]: BodyFormat.String
			},
			body
		};
		case body instanceof FormData: return {
			headers: { [BODY_FORMAT_KEY]: BodyFormat.FormData },
			body
		};
		case body instanceof URLSearchParams: return {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				[BODY_FORMAT_KEY]: BodyFormat.URLSearchParams
			},
			body
		};
		case body instanceof File: {
			const formData = new FormData();
			formData.append(BODY_FORMAL_FILE, body, body.name);
			return {
				headers: { [BODY_FORMAT_KEY]: BodyFormat.File },
				body: formData
			};
		}
		case body instanceof Blob: return {
			headers: { [BODY_FORMAT_KEY]: BodyFormat.Blob },
			body
		};
		case body instanceof ArrayBuffer: return {
			headers: { [BODY_FORMAT_KEY]: BodyFormat.ArrayBuffer },
			body
		};
		case body instanceof Uint8Array: return {
			headers: { [BODY_FORMAT_KEY]: BodyFormat.Uint8Array },
			body: new Uint8Array(body)
		};
		default: return;
	}
}
async function extractBody(instance, client, source) {
	const contentType = source.headers.get("content-type");
	const startType = source.headers.get(BODY_FORMAT_KEY);
	const clone = source.clone();
	switch (true) {
		case startType === BodyFormat.Seroval: return await deserializeJSONStream(clone);
		case startType === BodyFormat.String: return await clone.text();
		case startType === BodyFormat.File: return (await clone.formData()).get(BODY_FORMAL_FILE);
		case startType === BodyFormat.FormData:
		case contentType?.startsWith("multipart/form-data"): return await clone.formData();
		case startType === BodyFormat.URLSearchParams:
		case contentType?.startsWith("application/x-www-form-urlencoded"): return new URLSearchParams(await clone.text());
		case startType === BodyFormat.Blob: return await clone.blob();
		case startType === BodyFormat.ArrayBuffer: return await clone.arrayBuffer();
		case startType === BodyFormat.Uint8Array: return new Uint8Array(await clone.arrayBuffer());
	}
}
var _tmpl$$2 = [
	"<span",
	" style=\"font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;\">",
	"</span>"
];
var _tmpl$2$1 = ["<span", " style=\"font-size:1.5em;text-align:center;position:fixed;left:0px;bottom:55%;width:100%;\">500 | Internal Server Error</span>"];
var ErrorBoundary$1 = (props) => {
	const message = "500 | Internal Server Error";
	return createComponent(ErrorBoundary, {
		fallback: (error) => {
			console.error(error);
			return [ssr(_tmpl$$2, ssrHydrationKey(), escape(message)), createComponent(HttpStatusCode, { code: 500 })];
		},
		get children() {
			return props.children;
		}
	});
};
var TopErrorBoundary = (props) => {
	let isError = false;
	const res = catchError(() => props.children, (err) => {
		console.error(err);
		isError = !!err;
	});
	return isError ? [ssr(_tmpl$2$1, ssrHydrationKey()), createComponent(HttpStatusCode, { code: 500 })] : res;
};
/**
* Patches the data-vite-dev-id attribute for style tags of virtual modules
*
* Per Vite's convention, virtual module ids are prefixed with \0 (null byte):
* https://vite.dev/guide/api-plugin#virtual-modules-convention
*
* However this null byte cannot be server rendered properly.
* Vite client runtime then fails to find style's with wrong null bytes,
* and instead inserts duplicate style's.
*
* This patch replaces the serializable /@id/__x00__ with the proper null byte,
* and has to run before Vite's client runtime:
* https://github.com/vitejs/vite/blob/130e7181a55c524383c63bbfb1749d0ff7185cad/packages/vite/src/client/client.ts#L529
*
* TODO: This should be solved in Vite directly!
*/
var patch = function() {
	document.querySelectorAll("style[data-vite-dev-id]").forEach(function(el) {
		el.setAttribute("data-vite-dev-id", el.dataset.viteDevId.replace("/@id/__x00__", "\0"));
	});
};
`${patch.toString()}`;
var PatchVirtualDevStyles = (props) => {};
var _tmpl$$1 = [
	"<script",
	" type=\"module\"",
	" async",
	"><\/script>"
];
var docType = ssr("<!DOCTYPE html>");
/**
*
* Read more: https://docs.solidjs.com/solid-start/reference/server/start-server
*/
function StartServer(props) {
	const context = getRequestEvent();
	const nonce = context.nonce;
	useAssets$1(context.assets, nonce);
	return createComponent(NoHydration, { get children() {
		return [docType, createComponent(TopErrorBoundary, { get children() {
			return createComponent(props.document, {
				get assets() {
					return createComponent(HydrationScript, {});
				},
				get scripts() {
					return [createComponent(PatchVirtualDevStyles, { nonce }), ssr(_tmpl$$1, ssrHydrationKey(), ssrAttribute("nonce", escape(nonce, true), false), ssrAttribute("src", escape(getSsrManifest("client").path("./src/entry-client.tsx"), true), false))];
				},
				get children() {
					return createComponent(Hydration, { get children() {
						return createComponent(ErrorBoundary$1, { get children() {
							return createComponent(App$1, {});
						} });
					} });
				}
			});
		} })];
	} });
}
var NullProtoObj = /* @__PURE__ */ (() => {
	const e = function() {};
	return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
function createRouter() {
	return {
		root: { key: "" },
		static: new NullProtoObj()
	};
}
function scanFirstGroup(path) {
	let i = 0;
	let depth = 0;
	for (; i < path.length; i++) {
		const c = path.charCodeAt(i);
		if (c === 92) i++;
		else if (c === 40) depth++;
		else if (c === 41 && depth > 0) depth--;
		else if (c === 123 && depth === 0) break;
	}
	if (i >= path.length) return;
	let j = i + 1;
	depth = 0;
	for (; j < path.length; j++) {
		const c = path.charCodeAt(j);
		if (c === 92) j++;
		else if (c === 40) depth++;
		else if (c === 41 && depth > 0) depth--;
		else if (c === 125 && depth === 0) break;
	}
	if (j >= path.length) return;
	const mod = path[j + 1];
	const hasMod = mod === "?" || mod === "+" || mod === "*";
	return [
		path.slice(0, i),
		path.slice(i + 1, j),
		path.slice(j + (hasMod ? 2 : 1)),
		hasMod ? mod : void 0
	];
}
function expandGroupDelimiters(path) {
	if (!path.includes("{")) return;
	const group = scanFirstGroup(path);
	if (!group) return;
	const [pre, body, suf, mod] = group;
	if (!mod) return [pre + body + suf];
	if (mod === "?") return [pre + body + suf, pre + suf];
	if (body.includes("/")) throw new Error("unsupported group repetition across segments");
	return [`${pre}(?:${body})${mod}${suf}`];
}
var UNNAMED_GROUP_PREFIX = "__rou3_unnamed_";
var _unnamedGroupPrefixLength = 15;
function hasSegmentWildcard(segment) {
	let depth = 0;
	for (let i = 0; i < segment.length; i++) {
		const ch = segment.charCodeAt(i);
		if (ch === 92) {
			i++;
			continue;
		}
		if (ch === 40) {
			depth++;
			continue;
		}
		if (ch === 41 && depth > 0) {
			depth--;
			continue;
		}
		if (ch === 42 && depth === 0) return true;
	}
	return false;
}
function replaceSegmentWildcards(segment, unnamedStart, toGroupKey = toUnnamedGroupKey) {
	let depth = 0;
	let nextIndex = unnamedStart;
	let replaced = "";
	for (let i = 0; i < segment.length; i++) {
		const ch = segment.charCodeAt(i);
		if (ch === 92) {
			replaced += segment[i];
			if (i + 1 < segment.length) replaced += segment[++i];
			continue;
		}
		if (ch === 40) {
			depth++;
			replaced += segment[i];
			continue;
		}
		if (ch === 41 && depth > 0) {
			depth--;
			replaced += segment[i];
			continue;
		}
		if (ch === 42 && depth === 0) {
			replaced += `(?<${toGroupKey(nextIndex++)}>[^/]*)`;
			continue;
		}
		replaced += segment[i];
	}
	return [replaced, nextIndex];
}
function toUnnamedGroupKey(index) {
	return `${UNNAMED_GROUP_PREFIX}${index}`;
}
function normalizeUnnamedGroupKey(key) {
	return key.startsWith("__rou3_unnamed_") ? key.slice(_unnamedGroupPrefixLength) : key;
}
function encodeEscapes(path) {
	if (!path.includes("\\")) return path;
	return path.replace(/\\([:(){}])/g, (_, c) => "�" + "ABCDE"[":(){}".indexOf(c)]);
}
function decodeEscaped(segment) {
	if (!segment.includes("�")) return segment;
	return segment.replace(/\uFFFD([A-E])/g, (_, c) => c === "A" ? ":" : c === "B" ? "(" : c === "C" ? ")" : c === "D" ? "{" : "}");
}
function expandModifiers(segments) {
	for (let i = 0; i < segments.length; i++) {
		const last = segments[i].charCodeAt(segments[i].length - 1);
		if (last !== 63 && last !== 43 && last !== 42) continue;
		const m = segments[i].match(/^(.*:[\w-]+(?:\([^)]*\))?)([?+*])$/);
		if (!m) continue;
		const pre = segments.slice(0, i);
		const suf = segments.slice(i + 1);
		if (m[2] === "?") return ["/" + pre.concat(m[1]).concat(suf).join("/"), "/" + pre.concat(suf).join("/")];
		const name = m[1].match(/:([\w-]+)/)?.[1] || "_";
		const wc = "/" + [
			...pre,
			`**:${name}`,
			...suf
		].join("/");
		const without = "/" + [...pre, ...suf].join("/");
		return m[2] === "+" ? [wc] : [wc, without];
	}
}
function normalizePath(path) {
	if (!path.includes("/.")) return path;
	const r = [];
	for (const s of path.split("/")) if (s === ".") continue;
	else if (s === ".." && r.length > 1) r.pop();
	else r.push(s);
	return r.join("/") || "/";
}
function splitPath(path) {
	const s = path.split("/");
	s.shift();
	if (s[s.length - 1] === "") s.pop();
	return s;
}
function getMatchParams(segments, paramsMap) {
	const params = new NullProtoObj();
	for (const [index, name] of paramsMap) {
		const segment = index < 0 ? segments.slice(-(index + 1)).join("/") : segments[index];
		if (typeof name === "string") params[name] = segment;
		else {
			const match = segment.match(name);
			if (match) for (const key in match.groups) params[normalizeUnnamedGroupKey(key)] = match.groups[key];
		}
	}
	return params;
}
function addRoute(ctx, method = "", path, data) {
	method = method.toUpperCase();
	if (path.charCodeAt(0) !== 47) path = `/${path}`;
	const groupExpanded = expandGroupDelimiters(path);
	if (groupExpanded) {
		for (const expandedPath of groupExpanded) addRoute(ctx, method, expandedPath, data);
		return;
	}
	path = encodeEscapes(path);
	const segments = splitPath(path);
	const expanded = expandModifiers(segments);
	if (expanded) {
		for (const p of expanded) addRoute(ctx, method, p, data);
		return;
	}
	let node = ctx.root;
	let _unnamedParamIndex = 0;
	const paramsMap = [];
	const paramsRegexp = [];
	for (let i = 0; i < segments.length; i++) {
		let segment = segments[i];
		if (segment.startsWith("**")) {
			if (!node.wildcard) node.wildcard = { key: "**" };
			node = node.wildcard;
			paramsMap.push([
				-(i + 1),
				segment.split(":")[1] || "_",
				segment.length === 2
			]);
			break;
		}
		const hasParen = segment.includes("(");
		const hasWildcard = !hasParen && hasSegmentWildcard(segment);
		if (segment === "*" || hasParen || hasWildcard || segment.includes(":")) {
			if (!node.param) node.param = { key: "*" };
			node = node.param;
			if (segment === "*") paramsMap.push([
				i,
				String(_unnamedParamIndex++),
				true
			]);
			else if (hasParen || hasWildcard || segment.includes(":", 1) || !/^:[\w-]+$/.test(segment)) {
				const [regexp, nextIndex] = getParamRegexp(segment, _unnamedParamIndex);
				_unnamedParamIndex = nextIndex;
				paramsRegexp[i] = regexp;
				node.hasRegexParam = true;
				paramsMap.push([
					i,
					regexp,
					false
				]);
			} else paramsMap.push([
				i,
				segment.slice(1),
				false
			]);
			continue;
		}
		if (segment === "\\*") segment = segments[i] = "*";
		else if (segment === "\\*\\*") segment = segments[i] = "**";
		segment = segments[i] = decodeEscaped(segment);
		const child = node.static?.[segment];
		if (child) node = child;
		else {
			const staticNode = { key: segment };
			if (!node.static) node.static = new NullProtoObj();
			node.static[segment] = staticNode;
			node = staticNode;
		}
	}
	const hasParams = paramsMap.length > 0;
	const methods = node.methods ??= new NullProtoObj();
	(methods[method] ??= []).push({
		data: data || null,
		paramsRegexp,
		paramsMap: hasParams ? paramsMap : void 0
	});
	if (!hasParams) ctx.static["/" + segments.join("/")] = node;
}
function getParamRegexp(segment, unnamedStart = 0) {
	let _i = unnamedStart;
	let _s = "", _d = 0;
	for (let j = 0; j < segment.length; j++) {
		const c = segment.charCodeAt(j);
		if (c === 40) _d++;
		else if (c === 41 && _d > 0) _d--;
		else if (c === 92 && _d === 0 && j + 1 < segment.length) {
			const n = segment[j + 1];
			if (n !== ":" && n !== "(" && n !== "*" && n !== "\\") {
				_s += "￾" + n;
				j++;
				continue;
			}
		} else if (c === 46 && _d === 0) {
			_s += "\\.";
			continue;
		}
		_s += segment[j];
	}
	[_s, _i] = replaceSegmentWildcards(_s, _i);
	const regex = _s.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, p) => `(?<${id}>${p || "[^/]+"})`).replace(/\((?![?<])/g, () => `(?<${toUnnamedGroupKey(_i++)}>`).replace(/\uFFFE(.)/g, (_, c) => /[.*+?^${}()|[\]\\]/.test(c) ? `\\${c}` : c);
	return [new RegExp(`^${regex}$`), _i];
}
function findRoute(ctx, method = "", path, opts) {
	if (opts?.normalize) path = normalizePath(path);
	if (path.charCodeAt(path.length - 1) === 47) path = path.slice(0, -1);
	const staticNode = ctx.static[path];
	if (staticNode && staticNode.methods) {
		const staticMatch = staticNode.methods[method] || staticNode.methods[""];
		if (staticMatch !== void 0) return staticMatch[0];
	}
	const segments = splitPath(path);
	const match = _lookupTree(ctx.root, method, segments, 0);
	if (match === void 0) return;
	if (opts?.params === false) return match;
	return {
		data: match.data,
		params: match.paramsMap ? getMatchParams(segments, match.paramsMap) : void 0
	};
}
function _lookupTree(node, method, segments, index) {
	if (index === segments.length) {
		if (node.methods) {
			const match = _selectMatcher(node.methods, method, segments, node.key === "*", false);
			if (match) return match;
		}
		return node.param?.methods && _selectMatcher(node.param.methods, method, segments, true, true) || node.wildcard?.methods && _selectMatcher(node.wildcard.methods, method, segments, true, true) || void 0;
	}
	const segment = segments[index];
	if (node.static) {
		const staticChild = node.static[segment];
		if (staticChild) {
			const match = _lookupTree(staticChild, method, segments, index + 1);
			if (match) return match;
		}
	}
	if (node.param) {
		const match = _lookupTree(node.param, method, segments, index + 1);
		if (match) return match;
	}
	if (node.wildcard && node.wildcard.methods) return _selectMatcher(node.wildcard.methods, method, segments, true, false);
}
function _selectMatcher(methods, method, segments, dynamicTerminal, optionalOnly) {
	const match = methods[method] || methods[""];
	if (!match) return;
	const first = match[0];
	if (match.length === 1 && first.paramsRegexp.length === 0) {
		if (!optionalOnly) return first;
		const pMap = first.paramsMap;
		return pMap?.[pMap.length - 1]?.[2] ? first : void 0;
	}
	let best;
	let bestWeight = -1;
	for (const m of match) {
		const pMap = m.paramsMap;
		const lastOptional = pMap?.[pMap.length - 1]?.[2];
		if (optionalOnly && !lastOptional) continue;
		let weight = dynamicTerminal && pMap && !lastOptional ? 1 : 0;
		const regexps = m.paramsRegexp;
		for (let i = 0; i < regexps.length; i++) if (regexps[i]) {
			if (!regexps[i].test(segments[i])) {
				weight = -1;
				break;
			}
			weight++;
		}
		if (weight > bestWeight) {
			best = m;
			bestWeight = weight;
		}
	}
	return best;
}
var _P = "￾";
function replaceEscapesOutsideGroups(segment) {
	let r = "", d = 0;
	for (let i = 0; i < segment.length; i++) {
		const c = segment.charCodeAt(i);
		if (c === 40) d++;
		else if (c === 41 && d > 0) d--;
		else if (c === 92 && d === 0 && i + 1 < segment.length) {
			const n = segment[i + 1];
			if (n !== ":" && n !== "(" && n !== "*" && n !== "\\") {
				r += _P + n;
				i++;
				continue;
			}
		}
		r += segment[i];
	}
	return r;
}
function resolveEscapePlaceholders(str) {
	return str.replace(/\uFFFE(.)/g, (_, c) => /[.*+?^${}()|[\]\\]/.test(c) ? `\\${c}` : c);
}
function escapeBareDots(str) {
	let r = "", d = 0;
	for (let i = 0; i < str.length; i++) {
		const c = str.charCodeAt(i);
		if (c === 92 || c === 65534) {
			r += str[i] + (str[i + 1] || "");
			i++;
		} else if (c === 40) {
			d++;
			r += str[i];
		} else if (c === 41) {
			if (d > 0) d--;
			r += str[i];
		} else if (c === 46 && d === 0) r += "\\.";
		else r += str[i];
	}
	return r;
}
function routeToRegExp(route = "/") {
	const inlineOptional = inlineOptionalGroup(route);
	if (inlineOptional) return inlineOptional;
	const groupExpanded = expandGroupDelimiters(route);
	if (groupExpanded) {
		const sources = groupExpanded.map((expandedRoute) => routeToRegExp(expandedRoute).source.slice(1, -1));
		return new RegExp(`^(?:${sources.join("|")})$`);
	}
	return _routeToRegExp(route);
}
function inlineOptionalGroup(route) {
	const group = scanFirstGroup(route);
	if (!group) return;
	const [pre, body, suf, mod] = group;
	if (mod !== "?" || suf !== "" || body === "" || scanFirstGroup(pre) || scanFirstGroup(body)) return;
	const baseSegs = routeToRegExpSegments(pre);
	const fullSegs = routeToRegExpSegments(pre + body);
	const baseLen = baseSegs.length;
	if (baseLen === 0 || fullSegs.length < baseLen) return;
	const midSegment = fullSegs.length === baseLen;
	const sharedLen = midSegment ? baseLen - 1 : baseLen;
	for (let i = 0; i < sharedLen; i++) if (fullSegs[i] !== baseSegs[i]) return;
	if (midSegment) {
		const prefix = baseSegs[baseLen - 1];
		const last = fullSegs[baseLen - 1];
		if (!last.startsWith(prefix)) return;
		if (/(?:\[\^\/\]|\.)[*+]\)?$/.test(prefix)) return;
		const k = prefix.length;
		const inlineSegs = fullSegs.slice(0, baseLen - 1);
		inlineSegs.push(`${last.slice(0, k)}(?:${last.slice(k)})?`);
		return new RegExp(`^/${inlineSegs.join("/")}/?$`);
	}
	const head = fullSegs.slice(0, baseLen).join("/");
	const tail = fullSegs.slice(baseLen).join("/");
	return new RegExp(`^/${head}(?:/${tail})?/?$`);
}
function _routeToRegExp(route) {
	return new RegExp(`^/${routeToRegExpSegments(route).join("/")}/?$`);
}
function routeToRegExpSegments(route) {
	const reSegments = [];
	let idCtr = 0;
	for (const segment of route.split("/")) {
		if (!segment) continue;
		if (segment === "*") reSegments.push(`(?<${toRegExpUnnamedKey(idCtr++)}>[^/]*)`);
		else if (segment.startsWith("**")) reSegments.push(segment === "**" ? "?(?<_>.*)" : `?(?<${segment.slice(3)}>.+)`);
		else if (segment.includes(":") || /(^|[^\\])\(/.test(segment) || hasSegmentWildcard(segment)) {
			const modMatch = segment.match(/^(.*:[\w-]+(?:\([^)]*\))?)([?+*])$/);
			if (modMatch) {
				const [, base, mod] = modMatch;
				const name = base.match(/:([\w-]+)/)?.[1] || `_${idCtr++}`;
				if (mod === "?") {
					const inner = escapeBareDots(base.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, pattern) => `(?<${id}>${pattern || "[^/]+"})`));
					if (reSegments.length > 0) {
						const prevQ = reSegments.pop();
						reSegments.push(`${prevQ}(?:/${inner})?`);
					} else reSegments.push(`?${inner}?`);
					continue;
				}
				const pattern = base.match(/:(\w+)(?:\(([^)]*)\))?/)?.[2];
				if (reSegments.length > 0) {
					const prevMod = reSegments.pop();
					if (pattern) {
						const repeated = `${pattern}(?:/${pattern})*`;
						reSegments.push(mod === "+" ? `${prevMod}/(?<${name}>${repeated})` : `${prevMod}(?:/(?<${name}>${repeated}))?`);
					} else reSegments.push(mod === "+" ? `${prevMod}/(?<${name}>.+)` : `${prevMod}(?:/(?<${name}>.*))?`);
				} else if (pattern) {
					const repeated = `${pattern}(?:/${pattern})*`;
					reSegments.push(mod === "+" ? `?(?<${name}>${repeated})` : `?(?<${name}>${repeated})?`);
				} else reSegments.push(mod === "+" ? `?(?<${name}>.+)` : `?(?<${name}>.*)`);
				continue;
			}
			let dynamicSegment = replaceEscapesOutsideGroups(segment);
			[dynamicSegment, idCtr] = replaceSegmentWildcards(dynamicSegment, idCtr, toRegExpUnnamedKey);
			reSegments.push(resolveEscapePlaceholders(escapeBareDots(dynamicSegment.replace(/:([\w-]+)(?:\(([^)]*)\))?/g, (_, id, pattern) => `(?<${id}>${pattern || "[^/]+"})`).replace(/(^|[^\\])\((?![?<])/g, (_, p) => `${p}(?<${toRegExpUnnamedKey(idCtr++)}>`))));
		} else reSegments.push(segment.replace(/\\(.)/g, "$1").replace(/[.*+?^${}()|[\]]/g, "\\$&"));
	}
	return reSegments;
}
function toRegExpUnnamedKey(index) {
	return `_${index}`;
}
function lazyInherit(target, source, sourceKey) {
	for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
		if (key === "constructor") continue;
		const targetDesc = Object.getOwnPropertyDescriptor(target, key);
		const desc = Object.getOwnPropertyDescriptor(source, key);
		let modified = false;
		if (desc.get) {
			modified = true;
			desc.get = targetDesc?.get || function() {
				return this[sourceKey][key];
			};
		}
		if (desc.set) {
			modified = true;
			desc.set = targetDesc?.set || function(value) {
				this[sourceKey][key] = value;
			};
		}
		if (!targetDesc?.value && typeof desc.value === "function") {
			modified = true;
			desc.value = function(...args) {
				return this[sourceKey][key](...args);
			};
		}
		if (modified) Object.defineProperty(target, key, desc);
	}
}
var _needsNormRE = /(?:(?:^|\/)(?:\.|\.\.|%2e|%2e\.|\.%2e|%2e%2e)(?:\/|$))|[\\^#"<>{}`\x00-\x20\x7f-\uffff]/i;
var _searchNeedsNormRE = /[#"'<>\x00-\x20\x7f-\uffff]/;
var FastURL = /* @__PURE__ */ (() => {
	const NativeURL = globalThis.URL;
	const NativeSearchParams = globalThis.URLSearchParams;
	const FastURLSearchParams = class URLSearchParams {
		#owner;
		#params;
		constructor(owner) {
			this.#owner = owner;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeSearchParams;
		}
		_adopt(params) {
			this.#params = params;
		}
		get _params() {
			if (!this.#params) {
				const search = this.#owner.search;
				this.#params ??= new NativeSearchParams(search);
			}
			return this.#params;
		}
		#mutable() {
			this.#owner._url;
			return this.#params;
		}
		append(name, value) {
			this.#mutable().append(name, value);
		}
		set(name, value) {
			this.#mutable().set(name, value);
		}
		delete(name, value) {
			this.#mutable().delete(name, value);
		}
		sort() {
			this.#mutable().sort();
		}
	};
	lazyInherit(FastURLSearchParams.prototype, NativeSearchParams.prototype, "_params");
	Object.setPrototypeOf(FastURLSearchParams.prototype, NativeSearchParams.prototype);
	Object.setPrototypeOf(FastURLSearchParams, NativeSearchParams);
	const FastURL = class URL {
		#url;
		#href;
		#protocol;
		#host;
		#pathname;
		#search;
		#searchParams;
		#pos;
		constructor(url) {
			if (typeof url === "string") {
				const isOriginForm = url[0] === "/";
				if (isOriginForm && !_searchNeedsNormRE.test(url)) this.#href = `http://localhost${url}`;
				else this.#url = new NativeURL(isOriginForm ? `http://localhost${url}` : url);
			} else if (_needsNormRE.test(url.pathname) || url.search && _searchNeedsNormRE.test(url.search)) this.#url = new NativeURL(`${url.protocol || "http:"}//${url.host || "localhost"}${url.pathname}${url.search || ""}`);
			else {
				this.#protocol = url.protocol;
				this.#host = url.host;
				this.#pathname = url.pathname;
				this.#search = url.search;
			}
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeURL;
		}
		get _url() {
			if (this.#url) return this.#url;
			this.#url = new NativeURL(this.href);
			this.#href = void 0;
			this.#protocol = void 0;
			this.#host = void 0;
			this.#pathname = void 0;
			this.#search = void 0;
			this.#pos = void 0;
			this.#searchParams?._adopt(this.#url.searchParams);
			return this.#url;
		}
		get href() {
			if (this.#url) return this.#url.href;
			if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
			return this.#href;
		}
		#getPos() {
			if (!this.#pos) {
				const url = this.href;
				const protoIndex = url.indexOf("://");
				const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
				const qIndex = pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex);
				this.#pos = [
					protoIndex,
					pathnameIndex,
					qIndex
				];
			}
			return this.#pos;
		}
		get pathname() {
			if (this.#url) return this.#url.pathname;
			if (this.#pathname === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.pathname;
				this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
			}
			return this.#pathname;
		}
		get search() {
			if (this.#url) return this.#url.search;
			if (this.#search === void 0) {
				const [, pathnameIndex, queryIndex] = this.#getPos();
				if (pathnameIndex === -1) return this._url.search;
				const url = this.href;
				this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
			}
			return this.#search;
		}
		get searchParams() {
			if (this.#searchParams) return this.#searchParams;
			if (this.#url) return this.#url.searchParams;
			return this.#searchParams = new FastURLSearchParams(this);
		}
		get protocol() {
			if (this.#url) return this.#url.protocol;
			if (this.#protocol === void 0) {
				const [protocolIndex] = this.#getPos();
				if (protocolIndex === -1) return this._url.protocol;
				const url = this.href;
				this.#protocol = url.slice(0, protocolIndex + 1);
			}
			return this.#protocol;
		}
		toString() {
			return this.href;
		}
		toJSON() {
			return this.href;
		}
	};
	lazyInherit(FastURL.prototype, NativeURL.prototype, "_url");
	Object.setPrototypeOf(FastURL.prototype, NativeURL.prototype);
	Object.setPrototypeOf(FastURL, NativeURL);
	return FastURL;
})();
var NodeResponse = /* @__PURE__ */ (() => {
	const NativeResponse = globalThis.Response;
	class NodeResponse {
		#body;
		#init;
		#headers;
		#response;
		constructor(body, init) {
			this.#body = body;
			this.#init = init;
		}
		static [Symbol.hasInstance](val) {
			return val instanceof NativeResponse;
		}
		static json(data, init) {
			const body = JSON.stringify(data);
			if (body === void 0) throw new TypeError("Value is not JSON serializable");
			let headers = init?.headers;
			if (!headers) headers = { "content-type": "application/json" };
			else {
				const merged = new Headers(headers);
				if (!merged.has("content-type")) merged.set("content-type", "application/json");
				headers = merged;
			}
			return new NodeResponse(body, init ? {
				...init,
				headers
			} : { headers });
		}
		get status() {
			return this.#response?.status || this.#init?.status || 200;
		}
		get statusText() {
			return this.#response?.statusText || this.#init?.statusText || "";
		}
		get headers() {
			if (this.#response) return this.#response.headers;
			if (this.#headers) return this.#headers;
			return this.#headers = new Headers(this.#init?.headers);
		}
		get ok() {
			if (this.#response) return this.#response.ok;
			const status = this.status;
			return status >= 200 && status < 300;
		}
		get _response() {
			if (this.#response) return this.#response;
			let body = this.#body;
			if (body && typeof body.pipe === "function" && !(body instanceof Readable)) {
				const stream = new PassThrough();
				body.pipe(stream);
				const abort = body.abort;
				if (abort) stream.once("close", () => abort());
				body = stream;
			}
			this.#response = new NativeResponse(body, this.#headers ? {
				...this.#init,
				headers: this.#headers
			} : this.#init);
			this.#init = void 0;
			this.#headers = void 0;
			this.#body = void 0;
			return this.#response;
		}
		_toNodeResponse() {
			const status = this.status;
			const statusText = this.statusText;
			let body;
			let contentType;
			let contentLength;
			if (this.#response) body = this.#response.body;
			else if (this.#body != null) if (this.#body instanceof ReadableStream) body = this.#body;
			else if (typeof this.#body === "string") {
				body = this.#body;
				contentType = "text/plain; charset=UTF-8";
				contentLength = Buffer.byteLength(this.#body);
			} else if (this.#body instanceof ArrayBuffer) {
				body = Buffer.from(this.#body);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Uint8Array) {
				body = this.#body;
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof DataView) {
				body = Buffer.from(this.#body.buffer, this.#body.byteOffset, this.#body.byteLength);
				contentLength = this.#body.byteLength;
			} else if (this.#body instanceof Blob) {
				body = this.#body.stream();
				contentType = this.#body.type;
				contentLength = this.#body.size;
			} else if (typeof this.#body.pipe === "function") body = this.#body;
			else body = this._response.body;
			const headers = [];
			const initHeaders = this.#init?.headers;
			const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders) : void 0);
			let hasContentTypeHeader;
			let hasContentLength;
			if (headerEntries) for (const [key, value] of headerEntries) {
				const lowerKey = typeof key === "string" ? key.toLowerCase() : String(key);
				if (Array.isArray(value)) for (const v of value) headers.push(lowerKey, v);
				else headers.push(lowerKey, value);
				if (lowerKey === "content-type") hasContentTypeHeader = true;
				else if (lowerKey === "content-length") hasContentLength = true;
			}
			if (contentType && !hasContentTypeHeader) headers.push("content-type", contentType);
			if (contentLength != null && !hasContentLength) headers.push("content-length", String(contentLength));
			this.#init = void 0;
			this.#headers = void 0;
			this.#response = void 0;
			this.#body = void 0;
			return {
				status,
				statusText,
				headers,
				body
			};
		}
	}
	lazyInherit(NodeResponse.prototype, NativeResponse.prototype, "_response");
	Object.setPrototypeOf(NodeResponse, NativeResponse);
	Object.setPrototypeOf(NodeResponse.prototype, NativeResponse.prototype);
	return NodeResponse;
})();
function stripBase(pathname, base) {
	if (pathname === base || pathname.startsWith(base + "/")) return "/" + pathname.slice(base.length).replace(/^\/+/, "");
	return pathname;
}
function decodePathname(pathname) {
	return decodeURI(pathname.includes("%25") ? pathname.replace(/%25/g, "%2525") : pathname);
}
var kEventNS = "h3.internal.event.";
var kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
var kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var kEventResErrHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.err.headers`);
var kMalformedURL = /* @__PURE__ */ Symbol.for(`${kEventNS}malformed`);
var H3Event = class {
	app;
	req;
	url;
	context;
	static __is_event__ = true;
	constructor(req, context, app) {
		this.context = req.context = context || req.context || new NullProtoObj();
		this.req = req;
		this.app = app;
		const _url = req._url;
		let url = _url && _url instanceof URL ? _url : new FastURL(req.url);
		if (url.pathname.includes("%")) try {
			const pathname = decodePathname(url.pathname);
			if (pathname !== url.pathname) url = new FastURL(`${url.protocol}//${url.host}${pathname}${url.search}`);
		} catch {
			this[kMalformedURL] = true;
		}
		this.url = url;
	}
	get res() {
		return this[kEventRes] ||= new H3EventResponse();
	}
	get runtime() {
		return this.req.runtime;
	}
	waitUntil(promise) {
		this.req.waitUntil?.(promise);
	}
	toString() {
		return `[${this.req.method}] ${this.req.url}`;
	}
	toJSON() {
		return this.toString();
	}
	get node() {
		return this.req.runtime?.node;
	}
	get headers() {
		return this.req.headers;
	}
	get path() {
		return this.url.pathname + this.url.search;
	}
	get method() {
		return this.req.method;
	}
};
var H3EventResponse = class {
	status;
	statusText;
	get headers() {
		return this[kEventResHeaders] ||= new Headers();
	}
	get errHeaders() {
		return this[kEventResErrHeaders] ||= new Headers();
	}
};
var DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
	return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
	if (!statusCode) return defaultStatusCode;
	if (typeof statusCode === "string") statusCode = +statusCode;
	if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) return defaultStatusCode;
	return statusCode;
}
var HTTPError = class HTTPError extends Error {
	get name() {
		return "HTTPError";
	}
	status;
	statusText;
	headers;
	cause;
	data;
	body;
	unhandled;
	static isError(input) {
		return input instanceof Error && input?.name === "HTTPError";
	}
	static status(status, statusText, details) {
		return new HTTPError({
			...details,
			statusText,
			status
		});
	}
	constructor(arg1, arg2) {
		let messageInput;
		let details;
		if (typeof arg1 === "string") {
			messageInput = arg1;
			details = arg2;
		} else details = arg1;
		const status = sanitizeStatusCode(details?.status || details?.statusCode || details?.cause?.status || details?.cause?.statusCode, 500);
		const statusText = sanitizeStatusMessage(details?.statusText || details?.statusMessage || details?.cause?.statusText || details?.cause?.statusMessage);
		const message = messageInput || details?.message || details?.cause?.message || details?.statusText || details?.statusMessage || [
			"HTTPError",
			status,
			statusText
		].filter(Boolean).join(" ");
		super(message, { cause: details });
		this.cause = details;
		this.status = status;
		this.statusText = statusText || void 0;
		const rawHeaders = details?.headers || details?.cause?.headers;
		this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
		this.unhandled = details?.unhandled ?? details?.cause?.unhandled ?? void 0;
		this.data = details?.data;
		this.body = details?.body;
	}
	get statusCode() {
		return this.status;
	}
	get statusMessage() {
		return this.statusText;
	}
	toJSON() {
		const unhandled = this.unhandled;
		return {
			status: this.status,
			statusText: this.statusText,
			unhandled,
			message: unhandled ? "HTTPError" : this.message,
			data: unhandled ? void 0 : this.data,
			...unhandled ? void 0 : this.body
		};
	}
};
function hasProp(obj, prop) {
	try {
		return prop in obj;
	} catch {
		return false;
	}
}
function isJSONSerializable(value, _type) {
	if (value === null || value === void 0) return true;
	if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
	if (typeof value.toJSON === "function") return true;
	if (Array.isArray(value)) return true;
	if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
	if (value instanceof NullProtoObj) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
var kEventDispose = /* @__PURE__ */ Symbol.for("h3.internal.event.dispose");
var kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
var kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
	if (typeof val?.then === "function") return val.then((resolvedVal) => toResponse(resolvedVal, event, config), (r) => toResponse(toError(r), event, config));
	let response;
	try {
		response = prepareResponse(val, event, config);
	} catch (error) {
		return toResponse(toError(error), event, config);
	}
	if (typeof response?.then === "function") return toResponse(response, event, config);
	const { onResponse } = config;
	if (onResponse) return Promise.resolve().then(() => onResponse(response, event)).catch((error) => {
		if (!config.silent) console.error(error);
	}).then(() => event[kEventDispose]?.observe(response, val) ?? response);
	return event[kEventDispose]?.observe(response, val) ?? response;
}
function toError(value) {
	if (value === kNotFound || value === kHandled || value instanceof Error) return value;
	if (typeof value === "number") return new HTTPError({ status: value });
	const error = new HTTPError({
		status: 500,
		unhandled: true
	});
	error.cause = value;
	return error;
}
var HTTPResponse = class {
	#headers;
	#init;
	body;
	constructor(body, init) {
		this.body = body;
		this.#init = init;
	}
	get status() {
		return this.#init?.status;
	}
	get statusText() {
		return this.#init?.statusText;
	}
	get headers() {
		return this.#headers ||= new Headers(this.#init?.headers);
	}
};
function prepareResponse(val, event, config, nested) {
	if (val === kHandled) return new NodeResponse(null);
	if (val === kNotFound) val = new HTTPError({
		status: 404,
		message: `Cannot find any route matching [${event.req.method}] ${event.url}`
	});
	if (val && val instanceof Error) {
		const isHTTPError = HTTPError.isError(val);
		const error = isHTTPError ? val : new HTTPError(val);
		if (!isHTTPError) {
			error.unhandled = true;
			if (val?.stack) error.stack = val.stack;
		}
		if (error.unhandled && !config.silent) console.error(error);
		const { onError } = config;
		const errHeaders = event[kEventRes]?.[kEventResErrHeaders];
		return onError && !nested ? Promise.resolve().then(() => onError(error, event)).catch((error) => error).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug, errHeaders);
	}
	const preparedRes = event[kEventRes];
	let preparedHeaders = preparedRes?.[kEventResHeaders];
	event[kEventRes] = void 0;
	if (!(val instanceof Response)) {
		const res = prepareResponseBody(val, event, config);
		const status = res.status || preparedRes?.status;
		return new NodeResponse(nullBody(event.req.method, status) ? null : res.body, {
			status,
			statusText: res.statusText || preparedRes?.statusText,
			headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
		});
	}
	if (val.status >= 400) preparedHeaders = preparedRes?.[kEventResErrHeaders];
	if (preparedHeaders && !nested) try {
		mergeHeaders$1(val.headers, preparedHeaders, val.headers);
	} catch {
		return new NodeResponse(nullBody(event.req.method, val.status) ? null : val.body, {
			status: val.status,
			statusText: val.statusText,
			headers: mergeHeaders$1(val.headers, preparedHeaders)
		});
	}
	return event.req.method === "HEAD" && val.body !== null ? new NodeResponse(null, {
		status: val.status,
		statusText: val.statusText,
		headers: val.headers
	}) : val;
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
	for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
	else target.set(name, value);
	return target;
}
var frozen = (name) => (...args) => {
	throw new Error(`Headers are frozen (${name} ${args.join(", ")})`);
};
var FrozenHeaders = class extends Headers {
	set = frozen("set");
	append = frozen("append");
	delete = frozen("delete");
};
var emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
var jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
	if (val === null || val === void 0) return {
		body: "",
		headers: emptyHeaders
	};
	const valType = typeof val;
	if (valType === "string") return { body: val };
	if (val instanceof Uint8Array) return {
		body: val,
		headers: new Headers({ "content-length": val.byteLength.toString() })
	};
	if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
	if (isJSONSerializable(val, valType)) return {
		body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
		headers: jsonHeaders
	};
	if (valType === "bigint") return {
		body: val.toString(),
		headers: jsonHeaders
	};
	if (val instanceof Blob) {
		const headers = new Headers({
			"content-type": val.type,
			"content-length": val.size.toString()
		});
		let filename = val.name;
		if (filename) {
			filename = encodeURIComponent(filename);
			headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
		}
		return {
			body: val.stream(),
			headers
		};
	}
	if (valType === "symbol") return { body: val.toString() };
	if (valType === "function") return { body: `${val.name}()` };
	return { body: val };
}
function nullBody(method, status) {
	return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug, errHeaders) {
	let headers = error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders);
	if (errHeaders) headers = mergeHeaders$1(headers, errHeaders);
	return new NodeResponse(JSON.stringify({
		...error.toJSON(),
		stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
	}, void 0, debug ? 2 : void 0), {
		status: error.status,
		statusText: error.statusText,
		headers
	});
}
function normalizeMiddleware(input, opts = {}) {
	const matcher = createMatcher(opts);
	if (!matcher && (input.length > 1 || input.constructor?.name === "AsyncFunction")) return input;
	return (event, next) => {
		if (matcher && !matcher(event)) return next();
		const res = input(event, next);
		return res === void 0 || res === kNotFound ? next() : res;
	};
}
function createMatcher(opts) {
	if (!opts.route && !opts.method && !opts.match) return;
	const routeMatcher = opts.route ? routeToRegExp(opts.route) : void 0;
	const method = opts.method?.toUpperCase();
	return function _middlewareMatcher(event) {
		if (method && event.req.method !== method) {
			if (!(method === "GET" && event.req.method === "HEAD")) return false;
		}
		if (opts.match && !opts.match(event)) return false;
		if (!routeMatcher) return true;
		const match = event.url.pathname.match(routeMatcher);
		if (!match) return false;
		if (match.groups) event.context.middlewareParams = {
			...event.context.middlewareParams,
			...match.groups
		};
		return true;
	};
}
function composeMiddleware(middleware) {
	let chain = (event, handler) => handler(event);
	for (let i = middleware.length - 1; i >= 0; i--) {
		const fn = middleware[i];
		const inner = chain;
		chain = (event, handler) => callLayer(fn, event, handler, inner);
	}
	return chain;
}
function composeHandler(middleware, handler) {
	const chain = composeMiddleware(middleware);
	return function _composedHandler(event) {
		return chain(event, handler);
	};
}
function callMiddleware(event, middleware, handler, index = 0) {
	return index === middleware.length ? handler(event) : callLayer(middleware[index], event, handler, (_event, _handler) => callMiddleware(_event, middleware, _handler, index + 1));
}
function callLayer(fn, event, handler, inner) {
	let nextCalled;
	let nextResult;
	const next = () => {
		if (nextCalled) return nextResult;
		nextCalled = true;
		nextResult = inner(event, handler);
		return nextResult;
	};
	const ret = fn(event, next);
	return isUnhandledResponse(ret) ? next() : typeof ret?.then === "function" ? ret.then((resolved) => isUnhandledResponse(resolved) ? next() : resolved) : ret;
}
function isUnhandledResponse(val) {
	return val === void 0 || val === kNotFound;
}
var plusRegex = /\+/g;
function parseQuery(input) {
	const params = new NullProtoObj();
	if (!input || input === "?") return params;
	const inputLength = input.length;
	let key = "";
	let value = "";
	let startingIndex = -1;
	let equalityIndex = -1;
	let shouldDecodeKey = false;
	let shouldDecodeValue = false;
	let keyHasPlus = false;
	let valueHasPlus = false;
	let hasBothKeyValuePair = false;
	let c = 0;
	for (let i = 0; i < inputLength + 1; i++) {
		c = i === inputLength ? 38 : input.charCodeAt(i);
		switch (c) {
			case 38:
				hasBothKeyValuePair = equalityIndex > startingIndex;
				if (!hasBothKeyValuePair) equalityIndex = i;
				key = input.slice(startingIndex + 1, equalityIndex);
				if (hasBothKeyValuePair || key.length > 0) {
					if (keyHasPlus) key = key.replace(plusRegex, " ");
					if (shouldDecodeKey) try {
						key = decodeURIComponent(key);
					} catch {}
					if (hasBothKeyValuePair) {
						value = input.slice(equalityIndex + 1, i);
						if (valueHasPlus) value = value.replace(plusRegex, " ");
						if (shouldDecodeValue) try {
							value = decodeURIComponent(value);
						} catch {}
					}
					const currentValue = params[key];
					if (currentValue === void 0) params[key] = value;
					else if (Array.isArray(currentValue)) currentValue.push(value);
					else params[key] = [currentValue, value];
				}
				value = "";
				startingIndex = i;
				equalityIndex = i;
				shouldDecodeKey = false;
				shouldDecodeValue = false;
				keyHasPlus = false;
				valueHasPlus = false;
				break;
			case 61:
				if (equalityIndex <= startingIndex) equalityIndex = i;
				else shouldDecodeValue = true;
				break;
			case 43:
				if (equalityIndex > startingIndex) valueHasPlus = true;
				else keyHasPlus = true;
				break;
			case 37: if (equalityIndex > startingIndex) shouldDecodeValue = true;
			else shouldDecodeKey = true;
		}
	}
	return params;
}
var VALIDATION_FAILED = "Validation failed";
async function validateData(data, fn, options) {
	if ("~standard" in fn) {
		const result = await fn["~standard"].validate(data);
		if (result.issues) throw createValidationError(options?.onError?.(result) || {
			message: VALIDATION_FAILED,
			issues: result.issues
		});
		return result.value;
	}
	try {
		const res = await fn(data);
		if (res === false) throw createValidationError(options?.onError?.({ issues: [{ message: VALIDATION_FAILED }] }) || { message: VALIDATION_FAILED });
		if (res === true) return data;
		return res ?? data;
	} catch (error) {
		throw createValidationError(error);
	}
}
function createValidationError(cause) {
	return HTTPError.isError(cause) ? cause : new HTTPError({
		cause,
		status: cause?.status || 400,
		statusText: cause?.statusText || VALIDATION_FAILED,
		message: cause?.message || VALIDATION_FAILED,
		data: {
			issues: cause?.issues,
			message: cause instanceof Error ? VALIDATION_FAILED : cause?.message || VALIDATION_FAILED
		}
	});
}
function getEventContext(event) {
	if (event.context) return event.context;
	event.req.context ??= {};
	return event.req.context;
}
function requestWithURL(req, url) {
	const cache = {
		url,
		_url: void 0
	};
	return new Proxy(req, { get(target, prop) {
		if (prop in cache) return cache[prop];
		const value = Reflect.get(target, prop);
		cache[prop] = typeof value === "function" ? value.bind(target) : value;
		return cache[prop];
	} });
}
function requestWithBaseURL(req, base) {
	const url = new URL(req.url);
	let pathname;
	try {
		pathname = decodePathname(url.pathname);
	} catch {
		pathname = url.pathname;
	}
	url.pathname = stripBase(pathname, base);
	return requestWithURL(req, url.href);
}
function toRequest(input, options) {
	if (typeof input === "string") {
		let url = input;
		if (url[0] === "/") {
			const headers = options?.headers ? new Headers(options.headers) : void 0;
			const host = headers?.get("host") || "localhost";
			url = `${(headers?.get("x-forwarded-proto") || "").split(",")[0].trim() === "https" ? "https" : "http"}://${host}${url}`;
		}
		return new Request(url, options);
	} else if (options || input instanceof URL) return new Request(input, options);
	return input;
}
function getQuery(event) {
	return parseQuery((event.url || new URL(event.req.url)).search.slice(1));
}
function getValidatedQuery(event, validate, options) {
	return validateData(getQuery(event), validate, options);
}
function getRouterParams(event, opts = {}) {
	let params = getEventContext(event).params || {};
	if (opts.decode) {
		params = { ...params };
		for (const key in params) params[key] = decodeRouterParam(params[key]);
	}
	return params;
}
var ENCODED_SEP_RE_G$1 = /%(?:25)*(?:2f|5c)/gi;
function decodeRouterParam(value) {
	if (!value.includes("%")) return value;
	let result = "";
	let lastIndex = 0;
	ENCODED_SEP_RE_G$1.lastIndex = 0;
	for (let m; m = ENCODED_SEP_RE_G$1.exec(value);) {
		result += decodeURIComponent(value.slice(lastIndex, m.index)) + m[0];
		lastIndex = m.index + m[0].length;
	}
	return result + decodeURIComponent(value.slice(lastIndex));
}
function getValidatedRouterParams(event, validate, options = {}) {
	const { decode, ...opts } = options;
	return validateData(getRouterParams(event, { decode }), validate, opts);
}
function getRouterParam(event, name, opts = {}) {
	return getRouterParams(event, opts)[name];
}
function isMethod(event, expected, allowHead) {
	if (allowHead && event.req.method === "HEAD") return true;
	if (typeof expected === "string") {
		if (event.req.method === expected) return true;
	} else if (expected.includes(event.req.method)) return true;
	return false;
}
function assertMethod(event, expected, allowHead) {
	if (!isMethod(event, expected, allowHead)) {
		const allowed = Array.isArray(expected) ? expected : [expected];
		throw new HTTPError({
			status: 405,
			headers: { Allow: allowHead ? [...allowed, "HEAD"].join(", ") : allowed.join(", ") }
		});
	}
}
function getRequestHost(event, opts = {}) {
	if (opts.xForwardedHost) {
		const xForwardedHost = (event.req.headers.get("x-forwarded-host") || "").split(",").shift()?.trim();
		if (xForwardedHost) return xForwardedHost;
	}
	return event.req.headers.get("host") || "";
}
function getRequestProtocol(event, opts = {}) {
	if (opts.xForwardedProto) {
		const forwardedProto = (event.req.headers.get("x-forwarded-proto") || "").split(",")[0].trim();
		if (forwardedProto === "https") return "https";
		if (forwardedProto === "http") return "http";
	}
	return (event.url || new URL(event.req.url)).protocol.slice(0, -1);
}
function getRequestURL(event, opts = {}) {
	const url = new URL(event.url || event.req.url);
	url.protocol = getRequestProtocol(event, opts);
	if (opts.xForwardedHost) {
		const host = getRequestHost(event, opts);
		if (host) {
			url.host = host;
			if (!/:\d+$/.test(host)) url.port = "";
		}
	}
	return url;
}
function getRequestIP(event, opts = {}) {
	if (opts.xForwardedFor) {
		const _header = event.req.headers.get("x-forwarded-for");
		if (_header) {
			const xForwardedFor = _header.split(",")[0].trim();
			if (xForwardedFor) return xForwardedFor;
		}
	}
	return event.req.context?.clientAddress || event.req.ip || void 0;
}
function defineHandler(input) {
	if (typeof input === "function") return handlerWithFetch(input);
	const handler = input.handler || (input.fetch ? function _fetchHandler(event) {
		return input.fetch(event.req);
	} : NoHandler);
	return Object.assign(handlerWithFetch(input.middleware?.length ? composeHandler(input.middleware, handler) : handler), input);
}
function handlerWithFetch(handler) {
	if ("fetch" in handler) return handler;
	return Object.assign(handler, { fetch: (req) => {
		if (typeof req === "string") req = new URL(req, "http://_");
		if (req instanceof URL) req = new Request(req);
		const event = new H3Event(req);
		try {
			return Promise.resolve(toResponse(handler(event), event));
		} catch (error) {
			return Promise.resolve(toResponse(toError(error), event));
		}
	} });
}
function toEventHandler(handler) {
	if (typeof handler === "function") return handler;
	if (typeof handler?.handler === "function" && handler.constructor?.["~h3"]) return handler.handler;
	if (typeof handler?.fetch === "function") return function _fetchHandler(event) {
		return handler.fetch(event.req);
	};
}
var NoHandler = () => kNotFound;
var H3Core = class {
	static "~h3" = true;
	config;
	"~middleware";
	"~routes" = [];
	"~dispatch";
	"~composed";
	constructor(config = {}) {
		this["~middleware"] = [];
		this.config = config;
		this.fetch = this.fetch.bind(this);
		this.handler = this.handler.bind(this);
	}
	fetch(request) {
		return this["~request"](request);
	}
	handler(event) {
		const route = this["~findRoute"](event);
		if (route) {
			event.context.params = route.params;
			event.context.matchedRoute = route.data;
		}
		return (this["~dispatch"] ??= createDispatcher(this))(event, route);
	}
	"~request"(request, context) {
		const event = new H3Event(request, context, this);
		let handlerRes;
		try {
			if (event[kMalformedURL] && !this.config.allowMalformedURL) throw new HTTPError({
				status: 400,
				message: "Bad Request"
			});
			if (this.config.onRequest) {
				const hookRes = this.config.onRequest(event);
				handlerRes = typeof hookRes?.then === "function" ? hookRes.then(() => this.handler(event)) : this.handler(event);
			} else handlerRes = this.handler(event);
		} catch (error) {
			handlerRes = Promise.reject(error);
		}
		return toResponse(handlerRes, event, this.config);
	}
	"~findRoute"(_event) {}
	"~addRoute"(_route) {
		this["~routes"].push(_route);
	}
	"~getMiddleware"(_event, route) {
		const routeMiddleware = route?.data.middleware;
		const globalMiddleware = this["~middleware"];
		return routeMiddleware ? [...globalMiddleware, ...routeMiddleware] : globalMiddleware;
	}
};
function createDispatcher(app) {
	if (app["~getMiddleware"] !== H3Core.prototype["~getMiddleware"]) return (event, route) => callMiddleware(event, app["~getMiddleware"](event, route), route?.data.handler || NoHandler);
	const middleware = app["~middleware"];
	if (middleware.length === 0) return (event, route) => routeHandler(route)(event);
	const composed = app["~composed"] ??= composeMiddleware(middleware);
	return (event, route) => composed(event, routeHandler(route));
}
function routeHandler(route) {
	const data = route?.data;
	if (!data) return NoHandler;
	return data.middleware?.length ? data["~composed"] ??= composeHandler(data.middleware, data.handler) : data.handler;
}
var H3 = /* @__PURE__ */ (() => {
	class H3 extends H3Core {
		"~rou3";
		constructor(config = {}) {
			super(config);
			this["~rou3"] = createRouter();
			this.request = this.request.bind(this);
			config.plugins?.forEach((plugin) => plugin(this));
		}
		register(plugin) {
			plugin(this);
			return this;
		}
		request(_req, _init, context) {
			return this["~request"](toRequest(_req, _init), context);
		}
		mount(base, input) {
			if ("handler" in input) {
				if (input["~middleware"].length > 0) {
					this["~middleware"].push((event, next) => {
						const originalPathname = event.url.pathname;
						if (!originalPathname.startsWith(base) || originalPathname.length > base.length && originalPathname[base.length] !== "/") return next();
						event.url.pathname = stripBase(originalPathname, base);
						const restore = () => {
							event.url.pathname = originalPathname;
						};
						try {
							const result = (input["~composed"] ??= composeMiddleware(input["~middleware"]))(event, () => {
								restore();
								return next();
							});
							if (typeof result?.then === "function") return Promise.resolve(result).finally(restore);
							restore();
							return result;
						} catch (err) {
							restore();
							throw err;
						}
					});
					this["~dispatch"] = this["~composed"] = void 0;
				}
				for (const r of input["~routes"]) this["~addRoute"]({
					...r,
					route: base + r.route
				});
			} else {
				const fetchHandler = "fetch" in input ? input.fetch : input;
				this.all(`${base}/**`, function _mountedMiddleware(event) {
					return fetchHandler(requestWithBaseURL(event.req, base));
				});
			}
			return this;
		}
		on(method, route, handler, opts) {
			const _method = (method || "").toUpperCase();
			route = new URL(route, "http://_").pathname;
			this["~addRoute"]({
				method: _method,
				route,
				handler: toEventHandler(handler),
				middleware: opts?.middleware,
				meta: {
					...handler.meta,
					...opts?.meta
				}
			});
			return this;
		}
		all(route, handler, opts) {
			return this.on("", route, handler, opts);
		}
		"~findRoute"(_event) {
			const match = findRoute(this["~rou3"], _event.req.method, _event.url.pathname);
			if (match === void 0 && _event.req.method === "HEAD") return findRoute(this["~rou3"], "GET", _event.url.pathname);
			return match;
		}
		"~addRoute"(_route) {
			addRoute(this["~rou3"], _route.method, _route.route, _route);
			super["~addRoute"](_route);
		}
		use(arg1, arg2, arg3) {
			let route;
			let fn;
			let opts;
			if (typeof arg1 === "string") {
				route = arg1;
				fn = arg2;
				opts = arg3;
			} else {
				fn = arg1;
				opts = arg2;
			}
			if (typeof fn !== "function" && "handler" in fn) return this.mount(route || "", fn);
			this["~middleware"].push(normalizeMiddleware(fn, {
				...opts,
				route
			}));
			this["~dispatch"] = this["~composed"] = void 0;
			return this;
		}
	}
	for (const method of [
		"GET",
		"POST",
		"PUT",
		"DELETE",
		"PATCH",
		"HEAD",
		"OPTIONS",
		"CONNECT",
		"TRACE",
		"QUERY"
	]) H3Core.prototype[method.toLowerCase()] = function(route, handler, opts) {
		return this.on(method, route, handler, opts);
	};
	return H3;
})();
var textEncoder = /* @__PURE__ */ new TextEncoder();
var textDecoder = /* @__PURE__ */ new TextDecoder();
var base64Code = [
	65,
	66,
	67,
	68,
	69,
	70,
	71,
	72,
	73,
	74,
	75,
	76,
	77,
	78,
	79,
	80,
	81,
	82,
	83,
	84,
	85,
	86,
	87,
	88,
	89,
	90,
	97,
	98,
	99,
	100,
	101,
	102,
	103,
	104,
	105,
	106,
	107,
	108,
	109,
	110,
	111,
	112,
	113,
	114,
	115,
	116,
	117,
	118,
	119,
	120,
	121,
	122,
	48,
	49,
	50,
	51,
	52,
	53,
	54,
	55,
	56,
	57,
	45,
	95
];
function base64Encode(data) {
	const buff = validateBinaryLike(data);
	if (globalThis.Buffer) return globalThis.Buffer.from(buff).toString("base64url");
	const bytes = [];
	let i;
	const len = buff.length;
	for (i = 2; i < len; i += 3) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4 | buff[i - 1] >> 4], base64Code[(buff[i - 1] & 15) << 2 | buff[i] >> 6], base64Code[buff[i] & 63]);
	if (i === len + 1) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4]);
	if (i === len) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4 | buff[i - 1] >> 4], base64Code[(buff[i - 1] & 15) << 2]);
	return String.fromCharCode(...bytes);
}
function base64Decode(b64Url) {
	if (globalThis.Buffer) return new Uint8Array(globalThis.Buffer.from(b64Url, "base64url"));
	const b64 = b64Url.replace(/-/g, "+").replace(/_/g, "/");
	const binString = atob(b64);
	const size = binString.length;
	const bytes = new Uint8Array(size);
	for (let i = 0; i < size; i++) bytes[i] = binString.charCodeAt(i);
	return bytes;
}
function validateBinaryLike(source) {
	if (typeof source === "string") return textEncoder.encode(source);
	else if (source instanceof Uint8Array) return source;
	else if (source instanceof ArrayBuffer) return new Uint8Array(source);
	throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer.`);
}
function serializeIterableValue(value) {
	switch (typeof value) {
		case "string": return textEncoder.encode(value);
		case "boolean":
		case "number":
		case "bigint":
		case "symbol": return textEncoder.encode(value.toString());
		case "object":
			if (value instanceof Uint8Array) return value;
			return textEncoder.encode(JSON.stringify(value));
	}
	return /* @__PURE__ */ new Uint8Array();
}
function coerceIterable(iterable) {
	if (typeof iterable === "function") iterable = iterable();
	if (Symbol.iterator in iterable) return iterable[Symbol.iterator]();
	if (Symbol.asyncIterator in iterable) return iterable[Symbol.asyncIterator]();
	return iterable;
}
function noContent(status = 204) {
	return new HTTPResponse(null, {
		status,
		statusText: "No Content"
	});
}
function redirect(location, status = 302, statusText) {
	return new HTTPResponse(`<html><head><meta http-equiv="refresh" content="0; url=${escapeHtml(location)}" /></head></html>`, {
		status,
		statusText: statusText || (status === 301 ? "Moved Permanently" : "Found"),
		headers: {
			"content-type": "text/html; charset=utf-8",
			location
		}
	});
}
async function iterable(iterable, options) {
	const serializer = options?.serializer ?? serializeIterableValue;
	const iterator = coerceIterable(iterable);
	let first = await iterator.next();
	return new HTTPResponse(new ReadableStream({
		async pull(controller) {
			const { value, done } = first ?? await iterator.next();
			first = void 0;
			if (value !== void 0) {
				const chunk = serializer(value);
				if (chunk !== void 0) controller.enqueue(chunk);
			}
			if (done) controller.close();
		},
		cancel() {
			iterator.return?.();
		}
	}));
}
var HTML_ESCAPES = {
	"&": "&amp;",
	"\"": "&quot;",
	"'": "&#39;",
	"<": "&lt;",
	">": "&gt;"
};
function escapeHtml(str) {
	return str.replace(/[&"'<>]/g, (c) => HTML_ESCAPES[c]);
}
function parseURLEncodedBody(body) {
	return collectEntries(new URLSearchParams(body).entries());
}
function parseFormData(form) {
	return collectEntries(form.entries());
}
function collectEntries(entries) {
	const parsed = new NullProtoObj();
	for (const [key, value] of entries) if (hasProp(parsed, key)) {
		if (!Array.isArray(parsed[key])) parsed[key] = [parsed[key]];
		parsed[key].push(value);
	} else parsed[key] = value;
	return parsed;
}
async function readBody(event, options) {
	const contentType = event.req.headers.get("content-type") || "";
	const type = options?.type;
	if (type === "formData") {
		let form;
		try {
			form = await event.req.formData();
		} catch (error) {
			if (HTTPError.isError(error)) throw error;
			throw new HTTPError({
				status: 400,
				statusText: "Bad Request",
				message: "Invalid form data body"
			});
		}
		return parseFormData(form);
	}
	const text = await event.req.text();
	if (type === "text") return text;
	if (!text) return;
	if (type === "urlencoded" || !type && contentType.startsWith("application/x-www-form-urlencoded")) return parseURLEncodedBody(text);
	try {
		return JSON.parse(text);
	} catch {
		throw new HTTPError({
			status: 400,
			statusText: "Bad Request",
			message: "Invalid JSON body"
		});
	}
}
async function readValidatedBody(event, validate, options) {
	return validateData(await readBody(event, options), validate, options);
}
var ignoredHeaders = /* @__PURE__ */ new Set([
	"transfer-encoding",
	"accept-encoding",
	"connection",
	"keep-alive",
	"upgrade",
	"expect",
	"te",
	"trailer",
	"host",
	"proxy-authorization",
	"proxy-connection"
]);
var framingHeaders = /* @__PURE__ */ new Set([
	"connection",
	"keep-alive",
	"transfer-encoding",
	"te",
	"trailer",
	"upgrade",
	"proxy-authorization",
	"proxy-connection"
]);
function connectionTokens(connection) {
	return new Set((connection || "").toLowerCase().split(",").map((name) => name.trim()).filter(Boolean));
}
var ignoredResponseHeaders = /* @__PURE__ */ new Set([
	"content-encoding",
	"content-length",
	"transfer-encoding",
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-connection",
	"upgrade",
	"trailer",
	"te"
]);
function rewriteCookieProperty(header, map, property) {
	const _map = typeof map === "string" ? { "*": map } : map;
	return header.replace(new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"), (match, prefix, previousValue) => {
		let newValue;
		if (Object.hasOwn(_map, previousValue)) newValue = _map[previousValue];
		else if (Object.hasOwn(_map, "*")) newValue = _map["*"];
		else return match;
		return newValue ? prefix + newValue : "";
	});
}
function applyXForwardedHeaders(headers, event) {
	const merged = headers instanceof Headers ? headers : new Headers(headers);
	const ip = event.req.ip;
	if (ip && !merged.has("x-forwarded-for")) merged.set("x-forwarded-for", ip);
	const proto = event.url.protocol.slice(0, -1);
	if (proto && !merged.has("x-forwarded-proto")) merged.set("x-forwarded-proto", proto);
	if (!merged.has("x-forwarded-host")) merged.set("x-forwarded-host", event.url.host);
	if (!merged.has("x-forwarded-port")) merged.set("x-forwarded-port", event.url.port || (proto === "https" ? "443" : "80"));
	return merged;
}
function rewriteLocationHeaders(headers, rewrite, targetOrigin, requestOrigin) {
	const rewriteValue = (value) => rewrite === true ? rewriteOrigin(value, targetOrigin, requestOrigin) : rewritePrefix(value, rewrite);
	const location = headers.get("location");
	if (location) {
		const rewritten = rewriteValue(location);
		if (rewritten) headers.set("location", rewritten);
	}
	const refresh = headers.get("refresh");
	if (refresh) {
		const match = refresh.match(/^(\s*(?:[\d.]+\s*[;,]\s*)?url\s*=\s*)(['"]?)(.*?)\2(\s*)$/i);
		const rewritten = match && rewriteValue(match[3]);
		if (rewritten) headers.set("refresh", match[1] + match[2] + rewritten + match[2] + match[4]);
	}
}
function rewriteOrigin(value, targetOrigin, requestOrigin) {
	if (!targetOrigin || targetOrigin === requestOrigin) return;
	const url = value.startsWith("//") ? URL.canParse(value, targetOrigin) ? new URL(value, targetOrigin) : void 0 : URL.canParse(value) ? new URL(value) : void 0;
	if (!url || url.origin !== targetOrigin) return;
	return requestOrigin + url.pathname + url.search + url.hash;
}
function rewritePrefix(value, map) {
	for (const prefix of Object.keys(map)) if (value.startsWith(prefix)) return map[prefix] + value.slice(prefix.length);
}
function abortable(run, signal) {
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener("abort", onAbort, { once: true });
		Promise.resolve(run()).then((value) => {
			signal.removeEventListener("abort", onAbort);
			resolve(value);
		}, (error) => {
			signal.removeEventListener("abort", onAbort);
			reject(error);
		});
	});
}
function mergeHeaders(defaults, ...inputs) {
	const _inputs = inputs.filter(Boolean);
	if (_inputs.length === 0) return defaults;
	const merged = new Headers(defaults);
	for (const input of _inputs) {
		const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
		for (const [key, value] of entries) if (value !== void 0) merged.set(key, value);
	}
	return merged;
}
async function proxyRequest(event, target, opts = {}) {
	const method = opts.fetchOptions?.method || event.req.method;
	const methodUpper = method.toUpperCase();
	const incomingBody = event.req.body;
	const requestBody = incomingBody != null && methodUpper !== "GET" && methodUpper !== "HEAD" ? incomingBody : void 0;
	const fetchHeaders = mergeHeaders(getProxyRequestHeaders(event, {
		host: target.startsWith("/"),
		forwardHeaders: opts.forwardHeaders,
		filterHeaders: opts.filterHeaders
	}), opts.fetchOptions?.headers, opts.headers);
	if (opts.fetchOptions && "body" in opts.fetchOptions || incomingBody && !requestBody) {
		if (fetchHeaders instanceof Headers) fetchHeaders.delete("content-length");
		else if (!Array.isArray(fetchHeaders)) delete fetchHeaders["content-length"];
	}
	const fetchBody = opts.fetchOptions?.body ?? requestBody;
	return proxy(event, target, {
		...opts,
		fetchOptions: {
			method,
			body: requestBody,
			...opts.fetchOptions,
			duplex: opts.fetchOptions?.duplex ?? (fetchBody != null ? "half" : void 0),
			headers: opts.xfwd ? applyXForwardedHeaders(fetchHeaders, event) : fetchHeaders
		}
	});
}
async function proxy(event, target, opts = {}) {
	const signals = [event.req.signal];
	if (opts.fetchOptions?.signal) signals.push(opts.fetchOptions.signal);
	let timeoutId;
	if (opts.timeout > 0 && Number.isFinite(opts.timeout)) {
		const timeoutController = new AbortController();
		timeoutId = setTimeout(() => timeoutController.abort(new DOMException("Proxy request timed out", "TimeoutError")), Math.min(Math.max(Math.trunc(opts.timeout), 1), 2147483647));
		signals.push(timeoutController.signal);
	}
	const signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];
	const fetchOptions = {
		headers: opts.headers,
		...opts.fetchOptions,
		redirect: opts.fetchOptions?.redirect ?? "manual",
		signal
	};
	let response;
	try {
		response = target[0] === "/" ? await abortable(() => event.app.fetch(createSubRequest(event, target, fetchOptions)), signal) : await fetch(target, fetchOptions);
	} catch (error) {
		if ((signal.aborted ? signal.reason : void 0)?.name === "TimeoutError" || error?.name === "TimeoutError") throw new HTTPError({
			status: 504,
			statusText: "Gateway Timeout",
			cause: error
		});
		if (signal.aborted || error?.name === "AbortError") {
			if (opts.propagateAbortError) throw error;
			if (event.req.signal.aborted) return new HTTPResponse(null, {
				status: 499,
				statusText: "Client Closed Request"
			});
		}
		throw new HTTPError({
			status: 502,
			cause: error
		});
	} finally {
		if (timeoutId !== void 0) clearTimeout(timeoutId);
	}
	if (response.type === "opaqueredirect") throw new HTTPError({
		status: 502,
		message: "Cannot relay an opaque redirect response on this runtime. Set `fetchOptions: { redirect: \"follow\" }` to follow upstream redirects instead."
	});
	if (response.type === "opaque" || response.type === "error" || response.status === 0) throw new HTTPError({
		status: 502,
		message: "Cannot relay an opaque or errored upstream response (status 0), typically caused by a `no-cors` request mode on browser/service-worker runtimes."
	});
	const headers = new Headers();
	const connectionNominated = connectionTokens(response.headers.get("connection"));
	for (const [key, value] of response.headers.entries()) {
		if (ignoredResponseHeaders.has(key) || connectionNominated.has(key) || key === "set-cookie") continue;
		headers.append(key, value);
	}
	const cookies = response.headers.getSetCookie();
	if (cookies.length > 0) {
		const _cookies = cookies.map((cookie) => {
			if (opts.cookieDomainRewrite) cookie = rewriteCookieProperty(cookie, opts.cookieDomainRewrite, "domain");
			if (opts.cookiePathRewrite) cookie = rewriteCookieProperty(cookie, opts.cookiePathRewrite, "path");
			return cookie;
		});
		for (const cookie of _cookies) headers.append("set-cookie", cookie);
	}
	const locationRewrite = opts.locationRewrite ?? true;
	if (locationRewrite !== false && (locationRewrite !== true || target[0] !== "/")) rewriteLocationHeaders(headers, locationRewrite, target[0] === "/" ? void 0 : new URL(target).origin, event.url.origin);
	if (opts.onResponse) await opts.onResponse(event, response);
	return new HTTPResponse(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
function getProxyRequestHeaders(event, opts) {
	const headers = new NullProtoObj();
	const filterHeaders = opts?.filterHeaders?.map((h) => h.toLowerCase());
	const forwardHeaders = opts?.forwardHeaders?.map((h) => h.toLowerCase());
	const connectionNominated = connectionTokens(event.req.headers.get("connection"));
	for (const [name, value] of event.req.headers.entries()) {
		if (filterHeaders?.includes(name)) continue;
		if (forwardHeaders?.includes(name) && !framingHeaders.has(name) && !connectionNominated.has(name)) {
			headers[name] = value;
			continue;
		}
		if (connectionNominated.has(name)) continue;
		if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
			headers[name] = value;
			continue;
		}
	}
	return headers;
}
async function fetchWithEvent(event, url, init) {
	if (url[0] !== "/") {
		if (init?.body != null && init.duplex === void 0) init = {
			...init,
			duplex: "half"
		};
		return fetch(url, init);
	}
	return event.app.fetch(createSubRequest(event, url, {
		...init,
		headers: mergeHeaders(getProxyRequestHeaders(event, { host: true }), init?.headers)
	}));
}
function createSubRequest(event, path, init) {
	const url = new URL(path, event.url);
	if (init.body != null && init.duplex === void 0) init = {
		...init,
		duplex: "half"
	};
	const req = new Request(url, init);
	req.runtime = event.req.runtime;
	req.waitUntil = event.req.waitUntil;
	req.ip = event.req.ip;
	return req;
}
var COOKIE_MAX_AGE_LIMIT$1 = 3456e4;
function endIndex(str, min, len) {
	const index = str.indexOf(";", min);
	return index === -1 ? len : index;
}
function eqIndex(str, min, max) {
	const index = str.indexOf("=", min);
	return index < max ? index : -1;
}
function valueSlice(str, min, max) {
	if (min === max) return "";
	let start = min;
	let end = max;
	do {
		const code = str.charCodeAt(start);
		if (code !== 32 && code !== 9) break;
	} while (++start < end);
	while (end > start) {
		const code = str.charCodeAt(end - 1);
		if (code !== 32 && code !== 9) break;
		end--;
	}
	return str.slice(start, end);
}
var NullObject = /* @__PURE__ */ (() => {
	const C = function() {};
	C.prototype = Object.create(null);
	return C;
})();
function parse(str, options) {
	const obj = new NullObject();
	const len = str.length;
	if (len < 2) return obj;
	const dec = options?.decode || decode;
	const allowMultiple = options?.allowMultiple || false;
	let index = 0;
	do {
		const eqIdx = eqIndex(str, index, len);
		if (eqIdx === -1) break;
		const endIdx = endIndex(str, index, len);
		if (eqIdx > endIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = valueSlice(str, index, eqIdx);
		if (options?.filter && !options.filter(key)) {
			index = endIdx + 1;
			continue;
		}
		const val = dec(valueSlice(str, eqIdx + 1, endIdx));
		if (allowMultiple) {
			const existing = obj[key];
			if (existing === void 0) obj[key] = val;
			else if (Array.isArray(existing)) existing.push(val);
			else obj[key] = [existing, val];
		} else if (obj[key] === void 0) obj[key] = val;
		index = endIdx + 1;
	} while (index < len);
	return obj;
}
function decode(str) {
	if (!str.includes("%")) return str;
	try {
		return decodeURIComponent(str);
	} catch {
		return str;
	}
}
var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
var pathValueRegExp = /^[\u0020-\u003A\u003C-\u007E]*$/;
var __toString = Object.prototype.toString;
function serialize(_a0, _a1, _a2) {
	const isObj = typeof _a0 === "object" && _a0 !== null;
	const options = isObj ? _a1 : _a2;
	const stringify = options?.stringify || JSON.stringify;
	const cookie = isObj ? _a0 : {
		..._a2,
		name: _a0,
		value: _a1 == void 0 ? "" : typeof _a1 === "string" ? _a1 : stringify(_a1)
	};
	const enc = options?.encode || encodeURIComponent;
	if (!cookieNameRegExp.test(cookie.name)) throw new TypeError(`argument name is invalid: ${cookie.name}`);
	const value = cookie.value ? enc(cookie.value) : "";
	if (!cookieValueRegExp.test(value)) throw new TypeError(`argument val is invalid: ${cookie.value}`);
	if (!cookie.secure) {
		if (cookie.partitioned) throw new TypeError(`Partitioned cookies must have the Secure attribute`);
		if (cookie.sameSite && String(cookie.sameSite).toLowerCase() === "none") throw new TypeError(`SameSite=None cookies must have the Secure attribute`);
		if (cookie.name.length > 9 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95) {
			const nameLower = cookie.name.toLowerCase();
			if (nameLower.startsWith("__secure-") || nameLower.startsWith("__host-")) throw new TypeError(`${cookie.name} cookies must have the Secure attribute`);
		}
	}
	if (cookie.name.length > 7 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95 && cookie.name.toLowerCase().startsWith("__host-")) {
		if (cookie.path !== "/") throw new TypeError(`__Host- cookies must have Path=/`);
		if (cookie.domain) throw new TypeError(`__Host- cookies must not have a Domain attribute`);
	}
	let str = cookie.name + "=" + value;
	if (cookie.maxAge !== void 0) {
		if (!Number.isInteger(cookie.maxAge)) throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
		str += "; Max-Age=" + Math.max(0, Math.min(cookie.maxAge, COOKIE_MAX_AGE_LIMIT$1));
	}
	if (cookie.domain) {
		if (!domainValueRegExp.test(cookie.domain)) throw new TypeError(`option domain is invalid: ${cookie.domain}`);
		str += "; Domain=" + cookie.domain;
	}
	if (cookie.path) {
		if (!pathValueRegExp.test(cookie.path)) throw new TypeError(`option path is invalid: ${cookie.path}`);
		str += "; Path=" + cookie.path;
	}
	if (cookie.expires) {
		if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) throw new TypeError(`option expires is invalid: ${cookie.expires}`);
		str += "; Expires=" + cookie.expires.toUTCString();
	}
	if (cookie.httpOnly) str += "; HttpOnly";
	if (cookie.secure) str += "; Secure";
	if (cookie.partitioned) str += "; Partitioned";
	if (cookie.priority) switch (typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0) {
		case "low":
			str += "; Priority=Low";
			break;
		case "medium":
			str += "; Priority=Medium";
			break;
		case "high":
			str += "; Priority=High";
			break;
		default: throw new TypeError(`option priority is invalid: ${cookie.priority}`);
	}
	if (cookie.sameSite) switch (typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite) {
		case true:
		case "strict":
			str += "; SameSite=Strict";
			break;
		case "lax":
			str += "; SameSite=Lax";
			break;
		case "none":
			str += "; SameSite=None";
			break;
		default: throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
	}
	return str;
}
function isDate(val) {
	return __toString.call(val) === "[object Date]";
}
var maxAgeRegExp$1 = /^-?\d+$/;
var _nullProto$1 = /* @__PURE__ */ Object.getPrototypeOf({});
function parseSetCookie$1(str, options) {
	const len = str.length;
	let _endIdx = len;
	let eqIdx = -1;
	for (let i = 0; i < len; i++) {
		const c = str.charCodeAt(i);
		if (c === 59) {
			_endIdx = i;
			break;
		}
		if (c === 61 && eqIdx === -1) eqIdx = i;
	}
	if (eqIdx >= _endIdx) eqIdx = -1;
	const name = eqIdx === -1 ? "" : _trim$1(str, 0, eqIdx);
	if (name && name in _nullProto$1) return void 0;
	let value = eqIdx === -1 ? _trim$1(str, 0, _endIdx) : _trim$1(str, eqIdx + 1, _endIdx);
	if (!name && !value) return void 0;
	if (name.length + value.length > 4096) return void 0;
	if (options?.decode !== false) value = _decode$1(value, options?.decode);
	const setCookie = {
		name,
		value
	};
	let index = _endIdx + 1;
	while (index < len) {
		let endIdx = len;
		let attrEqIdx = -1;
		for (let i = index; i < len; i++) {
			const c = str.charCodeAt(i);
			if (c === 59) {
				endIdx = i;
				break;
			}
			if (c === 61 && attrEqIdx === -1) attrEqIdx = i;
		}
		if (attrEqIdx >= endIdx) attrEqIdx = -1;
		const attr = attrEqIdx === -1 ? _trim$1(str, index, endIdx) : _trim$1(str, index, attrEqIdx);
		const val = attrEqIdx === -1 ? void 0 : _trim$1(str, attrEqIdx + 1, endIdx);
		if (val === void 0 || val.length <= 1024) switch (attr.toLowerCase()) {
			case "httponly":
				setCookie.httpOnly = true;
				break;
			case "secure":
				setCookie.secure = true;
				break;
			case "partitioned":
				setCookie.partitioned = true;
				break;
			case "domain":
				if (val) setCookie.domain = (val.charCodeAt(0) === 46 ? val.slice(1) : val).toLowerCase();
				break;
			case "path":
				setCookie.path = val;
				break;
			case "max-age":
				if (val && maxAgeRegExp$1.test(val)) setCookie.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT$1);
				break;
			case "expires": {
				if (!val) break;
				const date = new Date(val);
				if (Number.isFinite(date.valueOf())) {
					const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT$1 * 1e3);
					setCookie.expires = date > maxDate ? maxDate : date;
				}
				break;
			}
			case "priority": {
				if (!val) break;
				const priority = val.toLowerCase();
				if (priority === "low" || priority === "medium" || priority === "high") setCookie.priority = priority;
				break;
			}
			case "samesite": {
				if (!val) break;
				const sameSite = val.toLowerCase();
				if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") setCookie.sameSite = sameSite;
				else setCookie.sameSite = "lax";
				break;
			}
			default: {
				const attrLower = attr.toLowerCase();
				if (attrLower && !(attrLower in _nullProto$1)) setCookie[attrLower] = val;
			}
		}
		index = endIdx + 1;
	}
	return setCookie;
}
function _trim$1(str, start, end) {
	if (start === end) return "";
	let s = start;
	let e = end;
	while (s < e && (str.charCodeAt(s) === 32 || str.charCodeAt(s) === 9)) s++;
	while (e > s && (str.charCodeAt(e - 1) === 32 || str.charCodeAt(e - 1) === 9)) e--;
	return str.slice(s, e);
}
function _decode$1(value, decode) {
	if (!decode && !value.includes("%")) return value;
	try {
		return (decode || decodeURIComponent)(value);
	} catch {
		return value;
	}
}
var CHUNKED_COOKIE = "__chunked__";
var CHUNKS_MAX_LENGTH = 4e3;
function parseCookies(event) {
	return parse(event.req.headers.get("cookie") || "");
}
function getCookie(event, name) {
	return parseCookies(event)[name];
}
function setCookie(event, name, value, options) {
	const { encode, stringify, ...attrs } = options ?? {};
	const newCookie = serialize({
		name,
		value,
		path: "/",
		...attrs
	}, {
		encode,
		stringify
	});
	const currentCookies = event.res.headers.getSetCookie();
	if (currentCookies.length === 0) {
		event.res.headers.set("set-cookie", newCookie);
		return;
	}
	const namePrefix = `${name}=`;
	if (!currentCookies.some((cookie) => cookie.startsWith(namePrefix))) {
		event.res.headers.append("set-cookie", newCookie);
		return;
	}
	const newCookieKey = _getDistinctCookieKey(name, options || {});
	event.res.headers.delete("set-cookie");
	for (const cookie of currentCookies) {
		const parsed = parseSetCookie$1(cookie);
		if (!parsed) continue;
		if (_getDistinctCookieKey(cookie.split("=")?.[0], parsed) === newCookieKey) continue;
		event.res.headers.append("set-cookie", cookie);
	}
	event.res.headers.append("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
	setCookie(event, name, "", {
		...serializeOptions,
		maxAge: 0
	});
}
function getChunkedCookie(event, name) {
	const cookies = parseCookies(event);
	const mainCookie = cookies[name];
	if (!mainCookie || !mainCookie.startsWith(CHUNKED_COOKIE)) return mainCookie;
	const chunksCount = getChunkedCookieCount(mainCookie);
	if (chunksCount === 0) return;
	const chunks = [];
	for (let i = 1; i <= chunksCount; i++) {
		const chunk = cookies[chunkCookieName(name, i)];
		if (!chunk) return;
		chunks.push(chunk);
	}
	return chunks.join("");
}
function setChunkedCookie(event, name, value, options) {
	const chunkMaxLength = options?.chunkMaxLength || CHUNKS_MAX_LENGTH;
	const chunkCount = Math.ceil(value.length / chunkMaxLength);
	if (chunkCount > MAX_CHUNKED_COOKIE_COUNT) throw new HTTPError({
		status: 500,
		message: `Cannot set chunked cookie "${name}": value needs ${chunkCount} chunks, exceeding the maximum of ${MAX_CHUNKED_COOKIE_COUNT}.`
	});
	const previousCookie = getCookie(event, name);
	if (previousCookie?.startsWith(CHUNKED_COOKIE)) {
		const previousChunkCount = getChunkedCookieCount(previousCookie);
		const newChunkCount = chunkCount <= 1 ? 0 : chunkCount;
		for (let i = newChunkCount + 1; i <= previousChunkCount; i++) deleteCookie(event, chunkCookieName(name, i), options);
	}
	if (chunkCount <= 1) {
		setCookie(event, name, value, options);
		return;
	}
	setCookie(event, name, `${CHUNKED_COOKIE}${chunkCount}`, options);
	for (let i = 1; i <= chunkCount; i++) {
		const start = (i - 1) * chunkMaxLength;
		const end = start + chunkMaxLength;
		const chunkValue = value.slice(start, end);
		setCookie(event, chunkCookieName(name, i), chunkValue, options);
	}
}
function deleteChunkedCookie(event, name, serializeOptions) {
	const mainCookie = getCookie(event, name);
	deleteCookie(event, name, serializeOptions);
	const chunksCount = getChunkedCookieCount(mainCookie);
	if (chunksCount >= 0) for (let i = 0; i < chunksCount; i++) deleteCookie(event, chunkCookieName(name, i + 1), serializeOptions);
}
function _getDistinctCookieKey(name, options) {
	return [
		name,
		(options.domain || "").replace(/^\./, "").toLowerCase(),
		options.path || "/"
	].join(";");
}
var MAX_CHUNKED_COOKIE_COUNT = 100;
function getChunkedCookieCount(cookie) {
	if (!cookie?.startsWith(CHUNKED_COOKIE)) return NaN;
	const count = Number.parseInt(cookie.slice(11));
	if (Number.isNaN(count) || count < 0 || count > MAX_CHUNKED_COOKIE_COUNT) return NaN;
	return count;
}
function chunkCookieName(name, chunkNumber) {
	return `${name}.${chunkNumber}`;
}
function matchETag(ifNoneMatch, etag) {
	if (ifNoneMatch.trim() === "*") return true;
	const target = opaqueTag(etag);
	return splitETags(ifNoneMatch).some((tag) => opaqueTag(tag.trim()) === target);
}
function isCacheMatch(headers, validators) {
	const ifNoneMatch = headers.get("if-none-match");
	if (ifNoneMatch) return !!validators.etag && matchETag(ifNoneMatch, validators.etag);
	if (validators.lastModified) {
		const ifModifiedSince = headers.get("if-modified-since");
		return !!ifModifiedSince && new Date(ifModifiedSince) >= validators.lastModified;
	}
	return false;
}
function opaqueTag(tag) {
	return tag.startsWith("W/") ? tag.slice(2) : tag;
}
function splitETags(value) {
	const tags = [];
	let current = "";
	let inQuotes = false;
	for (const ch of value) if (ch === "\"") {
		inQuotes = !inQuotes;
		current += ch;
	} else if (ch === "," && !inQuotes) {
		tags.push(current);
		current = "";
	} else current += ch;
	tags.push(current);
	return tags;
}
var RE_PRIVATE = /(?:^|,)\s*(?:private|no-store)(?:\s*=|\s*,|\s*$)/i;
var RE_PUBLIC = /(?:^|,)\s*public(?:\s*=|\s*,|\s*$)/i;
function handleCacheHeaders(event, opts) {
	const cacheControls = [...opts.cacheControls || []];
	const joined = cacheControls.join(",");
	const isPrivate = RE_PRIVATE.test(joined);
	if (!isPrivate && !RE_PUBLIC.test(joined)) cacheControls.unshift("public");
	if (opts.maxAge !== void 0) {
		cacheControls.push(`max-age=${+opts.maxAge}`);
		if (!isPrivate) cacheControls.push(`s-maxage=${+opts.maxAge}`);
	}
	if (opts.etag) event.res.headers.set("etag", opts.etag);
	let lastModified;
	if (opts.modifiedTime) {
		lastModified = new Date(opts.modifiedTime);
		lastModified.setMilliseconds(0);
		event.res.headers.set("last-modified", lastModified.toUTCString());
	}
	event.res.headers.set("cache-control", cacheControls.join(", "));
	if (isCacheMatch(event.req.headers, {
		etag: opts.etag,
		lastModified
	})) {
		event.res.status = 304;
		return true;
	}
	return false;
}
String.raw`(?:^|/)(?:\.|%(?:25)*2e){1,2}(?:/|$)`;
String.raw`%(?:25)*(?:2f|5c)`;
var defaults = /* @__PURE__ */ Object.freeze({
	ttl: 0,
	timestampSkewSec: 60,
	localtimeOffsetMsec: 0,
	encryption: /* @__PURE__ */ Object.freeze({
		saltBits: 256,
		algorithm: "aes-256-cbc",
		iterations: 8192,
		minPasswordlength: 32
	}),
	integrity: /* @__PURE__ */ Object.freeze({
		saltBits: 256,
		algorithm: "sha256",
		iterations: 8192,
		minPasswordlength: 32
	})
});
var algorithms = /* @__PURE__ */ Object.freeze({
	"aes-128-ctr": /* @__PURE__ */ Object.freeze({
		keyBits: 128,
		ivBits: 128,
		name: "AES-CTR"
	}),
	"aes-256-cbc": /* @__PURE__ */ Object.freeze({
		keyBits: 256,
		ivBits: 128,
		name: "AES-CBC"
	}),
	sha256: /* @__PURE__ */ Object.freeze({
		keyBits: 256,
		ivBits: 128,
		name: "SHA-256"
	})
});
var macPrefix = "Fe26.2";
async function seal(object, password, opts) {
	const now = Date.now() + (opts.localtimeOffsetMsec || 0);
	if (!password) throw new Error("Empty password");
	const { id = "", encryption, integrity } = normalizePassword(password);
	if (id && !/^\w+$/.test(id)) throw new Error("Invalid password id");
	const { encrypted, key } = await encrypt(encryption, opts.encryption, JSON.stringify(object));
	const encryptedB64 = base64Encode(encrypted);
	const iv = base64Encode(key.iv);
	const expiration = opts.ttl ? now + opts.ttl : "";
	const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
	const mac = await hmacWithPassword(integrity, opts.integrity, macBaseString);
	return `${macBaseString}*${mac.salt}*${mac.digest}`;
}
async function unseal(sealed, password, opts) {
	const now = Date.now() + (opts.localtimeOffsetMsec || 0);
	if (!password) throw new Error("Empty password");
	const parts = sealed.split("*");
	if (parts.length !== 8) throw new Error("Incorrect number of sealed components");
	const [prefix, passwordId, encryptionSalt, encryptionIv, encryptedB64, expiration, hmacSalt, hmac] = parts;
	const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
	if ("Fe26.2" !== prefix) throw new Error("Wrong mac prefix");
	if (expiration) {
		if (!/^\d+$/.test(expiration)) throw new Error("Invalid expiration");
		if (Number.parseInt(expiration, 10) <= now - opts.timestampSkewSec * 1e3) throw new Error("Expired seal");
	}
	let pass = "";
	const _passwordId = passwordId || "default";
	if (typeof password === "string" || password instanceof Uint8Array) pass = password;
	else if (_passwordId in password) pass = password[_passwordId];
	else throw new Error(`Cannot find password: ${_passwordId}`);
	pass = normalizePassword(pass);
	if (!fixedTimeComparison((await hmacWithPassword(pass.integrity, {
		...opts.integrity,
		salt: hmacSalt
	}, macBaseString)).digest, hmac)) throw new Error("Bad hmac value");
	const encrypted = base64Decode(encryptedB64);
	const decryptOptions = {
		...opts.encryption,
		salt: encryptionSalt,
		iv: base64Decode(encryptionIv)
	};
	const decrypted = await decrypt(pass.encryption, decryptOptions, encrypted);
	return decrypted ? JSON.parse(decrypted) : null;
}
async function hmacWithPassword(password, options, data) {
	const key = await generateKey(password, {
		...options,
		hmac: true
	});
	const textBuffer = textEncoder.encode(data);
	const signed = await crypto.subtle.sign({ name: "HMAC" }, key.key, textBuffer);
	return {
		digest: base64Encode(new Uint8Array(signed)),
		salt: key.salt
	};
}
async function generateKey(password, options) {
	if (!password?.length) throw new Error("Empty password");
	if (options == null || typeof options !== "object") throw new Error("Bad options");
	if (!(options.algorithm in algorithms)) throw new Error(`Unknown algorithm: ${options.algorithm}`);
	const algorithm = algorithms[options.algorithm];
	let resultKey;
	let resultSalt;
	let resultIV;
	const hmac = options.hmac ?? false;
	const id = hmac ? {
		name: "HMAC",
		hash: algorithm.name
	} : { name: algorithm.name };
	const usage = hmac ? ["sign", "verify"] : ["encrypt", "decrypt"];
	if (typeof password === "string") {
		if (password.length < options.minPasswordlength) throw new Error(`Password string too short (min ${options.minPasswordlength} characters required)`);
		let { salt = "" } = options;
		if (!salt) {
			const { saltBits = 0 } = options;
			if (!saltBits) throw new Error("Missing salt and saltBits options");
			const randomSalt = randomBits(saltBits);
			salt = [...new Uint8Array(randomSalt)].map((x) => x.toString(16).padStart(2, "0")).join("");
		}
		const derivedKey = await pbkdf2(password, salt, options.iterations, algorithm.keyBits / 8, "SHA-1");
		resultKey = await crypto.subtle.importKey("raw", derivedKey, id, false, usage);
		resultSalt = salt;
	} else {
		if (password.length < algorithm.keyBits / 8) throw new Error("Key buffer (password) too small");
		resultKey = await crypto.subtle.importKey("raw", password, id, false, usage);
		resultSalt = "";
	}
	if (options.iv) resultIV = options.iv;
	else if ("ivBits" in algorithm) resultIV = randomBits(algorithm.ivBits);
	else throw new Error("Missing IV");
	return {
		key: resultKey,
		salt: resultSalt,
		iv: resultIV
	};
}
async function pbkdf2(password, salt, iterations, keyLength, hash) {
	const passwordBuffer = textEncoder.encode(password);
	const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits"]);
	const params = {
		name: "PBKDF2",
		hash,
		salt: textEncoder.encode(salt),
		iterations
	};
	return await crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
}
async function encrypt(password, options, data) {
	const key = await generateKey(password, options);
	const encrypted = await crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
	return {
		encrypted: new Uint8Array(encrypted),
		key
	};
}
async function decrypt(password, options, data) {
	const key = await generateKey(password, options);
	const decrypted = await crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
	return textDecoder.decode(decrypted);
}
function getEncryptParams(algorithm, key, data) {
	return [
		algorithm === "aes-128-ctr" ? {
			name: "AES-CTR",
			counter: key.iv,
			length: 128
		} : {
			name: "AES-CBC",
			iv: key.iv
		},
		key.key,
		typeof data === "string" ? textEncoder.encode(data) : data
	];
}
function fixedTimeComparison(a, b) {
	let mismatch = a.length === b.length ? 0 : 1;
	if (mismatch) b = a;
	for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return mismatch === 0;
}
function normalizePassword(password) {
	if (typeof password === "string" || password instanceof Uint8Array) return {
		encryption: password,
		integrity: password
	};
	if ("secret" in password) return {
		id: password.id,
		encryption: password.secret,
		integrity: password.secret
	};
	return {
		id: password.id,
		encryption: password.encryption,
		integrity: password.integrity
	};
}
function randomBits(bits) {
	if (bits < 1) throw new Error("Invalid random bits count");
	return randomBytes(Math.ceil(bits / 8));
}
function randomBytes(size) {
	const bytes = new Uint8Array(size);
	crypto.getRandomValues(bytes);
	return bytes;
}
var kGetSession = /* @__PURE__ */ Symbol.for("h3.internal.session.promise");
var kLegacySeal = /* @__PURE__ */ Symbol.for("h3.internal.session.legacy-seal");
var DEFAULT_SESSION_COOKIE = {
	path: "/",
	secure: true,
	httpOnly: true,
	sameSite: "lax"
};
async function useSession(event, config) {
	const sessionName = config.name || "h3";
	await getSession(event, config);
	const sessionManager = {
		get id() {
			return getEventContext(event)?.sessions?.[sessionName]?.id;
		},
		get data() {
			return getEventContext(event).sessions?.[sessionName]?.data || {};
		},
		update: async (update) => {
			await updateSession(event, config, update);
			return sessionManager;
		},
		clear: () => {
			clearSession(event, config);
			return Promise.resolve(sessionManager);
		}
	};
	return sessionManager;
}
async function getSession(event, config) {
	const sessionName = config.name || "h3";
	const context = getEventContext(event);
	if (!context.sessions) context.sessions = new NullProtoObj();
	const existingSession = context.sessions[sessionName];
	if (existingSession) return existingSession[kGetSession] || existingSession;
	const session = {
		id: "",
		createdAt: 0,
		data: new NullProtoObj()
	};
	context.sessions[sessionName] = session;
	let sealedSession;
	if (config.sessionHeader !== false) {
		const headerName = typeof config.sessionHeader === "string" ? config.sessionHeader.toLowerCase() : `x-${sessionName.toLowerCase()}-session`;
		const headerValue = event.req.headers.get(headerName);
		if (typeof headerValue === "string") sealedSession = headerValue;
	}
	let sessionFromCookie = false;
	if (!sealedSession) {
		sealedSession = getChunkedCookie(event, sessionName);
		sessionFromCookie = true;
	}
	if (sealedSession) {
		const promise = unsealSession(event, config, sealedSession).catch(() => {}).then(async (unsealed) => {
			const legacySeal = unsealed && unsealed[kLegacySeal];
			if (legacySeal) delete unsealed[kLegacySeal];
			Object.assign(session, unsealed);
			delete context.sessions[sessionName][kGetSession];
			if (legacySeal && sessionFromCookie) await updateSession(event, config);
			return session;
		});
		context.sessions[sessionName][kGetSession] = promise;
		await promise;
	}
	if (!session.id) {
		session.id = config.generateId?.() ?? (config.crypto || crypto).randomUUID();
		session.createdAt = Date.now();
		await updateSession(event, config);
	}
	return session;
}
async function updateSession(event, config, update) {
	const sessionName = config.name || "h3";
	const session = getEventContext(event).sessions?.[sessionName] || await getSession(event, config);
	if (typeof update === "function") update = update(session.data);
	if (update) Object.assign(session.data, update);
	if (config.cookie !== false && event.res) setChunkedCookie(event, sessionName, await sealSession(event, config), {
		...DEFAULT_SESSION_COOKIE,
		expires: config.maxAge ? new Date(session.createdAt + config.maxAge * 1e3) : void 0,
		...config.cookie
	});
	return session;
}
async function sealSession(event, config) {
	const sessionName = config.name || "h3";
	return await seal(getEventContext(event).sessions?.[sessionName] || await getSession(event, config), config.password, {
		...defaults,
		ttl: config.maxAge ? config.maxAge * 1e3 : 0,
		...config.seal
	});
}
async function unsealSession(_event, config, sealed) {
	const sealOptions = {
		...defaults,
		ttl: config.maxAge ? config.maxAge * 1e3 : 0,
		...config.seal
	};
	let unsealed;
	try {
		unsealed = await unseal(sealed, config.password, sealOptions);
	} catch (error) {
		if (config.legacySealFallback === false || sealOptions.integrity.iterations === 1 || !(error instanceof Error) || error.message !== "Bad hmac value") throw error;
		unsealed = await unseal(sealed, config.password, {
			...sealOptions,
			encryption: {
				...sealOptions.encryption,
				iterations: 1
			},
			integrity: {
				...sealOptions.integrity,
				iterations: 1
			}
		});
		if (unsealed) unsealed[kLegacySeal] = true;
	}
	if (config.maxAge) {
		if (Date.now() - (unsealed.createdAt || Number.NEGATIVE_INFINITY) > config.maxAge * 1e3) throw new Error("Session expired!");
	}
	return unsealed;
}
function clearSession(event, config) {
	const context = getEventContext(event);
	const sessionName = config.name || "h3";
	if (context.sessions?.[sessionName]) delete context.sessions[sessionName];
	if (event.res && config.cookie !== false) deleteChunkedCookie(event, sessionName, {
		...DEFAULT_SESSION_COOKIE,
		...config.cookie
	});
	return Promise.resolve();
}
function resolveCorsOptions(options = {}) {
	const defaultOptions = {
		origin: "*",
		methods: "*",
		allowHeaders: "*",
		exposeHeaders: "*",
		credentials: false,
		maxAge: false,
		preflight: { statusCode: 204 }
	};
	const resolved = {
		...defaultOptions,
		...options,
		preflight: {
			...defaultOptions.preflight,
			...options.preflight
		}
	};
	if (resolved.credentials && resolved.origin === "*") warnOnce("[h3] CORS: `credentials: true` with wildcard origin is not allowed. Browsers will reject the response.");
	if (resolved.credentials && (resolved.origin === "null" || Array.isArray(resolved.origin) && resolved.origin.includes("null"))) warnOnce("[h3] CORS: `credentials: true` with a `\"null\"` origin is dangerous. Any sandboxed iframe, `data:`/`file:` document, or opaque origin sends `Origin: null`, so credentials would be shared across untrusted contexts.");
	if (resolved.credentials && resolved.exposeHeaders === "*") warnOnce("[h3] CORS: `credentials: true` with wildcard `exposeHeaders` has no effect. Browsers treat `*` literally on credentialed requests — list the headers explicitly.");
	return resolved;
}
function isCorsOriginAllowed(origin, options) {
	const { origin: originOption } = options;
	if (!origin) return false;
	if (!originOption || originOption === "*") return true;
	if (typeof originOption === "function") return originOption(origin);
	if (Array.isArray(originOption)) return originOption.some((_origin) => {
		if (_origin instanceof RegExp) return _origin.test(origin);
		return origin === _origin;
	});
	return originOption === origin;
}
function createOriginHeaders(event, options) {
	const { origin: originOption } = options;
	const origin = event.req.headers.get("origin");
	if (!originOption || originOption === "*") return { "access-control-allow-origin": "*" };
	if (isCorsOriginAllowed(origin, options)) return {
		"access-control-allow-origin": origin,
		vary: "origin"
	};
	return { vary: "origin" };
}
function createMethodsHeaders(event, options) {
	const { methods, credentials } = options;
	if (!methods) return {};
	if (methods === "*") {
		if (credentials) {
			const requestMethod = event.req.headers.get("access-control-request-method");
			return requestMethod ? {
				"access-control-allow-methods": requestMethod,
				vary: "access-control-request-method"
			} : {};
		}
		return { "access-control-allow-methods": "*" };
	}
	return methods.length > 0 ? { "access-control-allow-methods": methods.join(",") } : {};
}
function createCredentialsHeaders(options) {
	const { credentials } = options;
	if (credentials) return { "access-control-allow-credentials": "true" };
	return {};
}
function createAllowHeaderHeaders(event, options) {
	const { allowHeaders } = options;
	if (!allowHeaders || allowHeaders === "*" || allowHeaders.length === 0) {
		const header = event.req.headers.get("access-control-request-headers");
		return header ? {
			"access-control-allow-headers": header,
			vary: "access-control-request-headers"
		} : { vary: "access-control-request-headers" };
	}
	return {
		"access-control-allow-headers": allowHeaders.join(","),
		vary: "access-control-request-headers"
	};
}
function createExposeHeaders(options) {
	const { exposeHeaders, credentials } = options;
	if (!exposeHeaders) return {};
	if (exposeHeaders === "*") return credentials ? {} : { "access-control-expose-headers": exposeHeaders };
	return { "access-control-expose-headers": exposeHeaders.join(",") };
}
function createMaxAgeHeader(options) {
	const { maxAge } = options;
	if (maxAge) return { "access-control-max-age": maxAge };
	return {};
}
var warnedMessages;
function warnOnce(message) {
	warnedMessages ??= /* @__PURE__ */ new Set();
	if (warnedMessages.has(message)) return;
	warnedMessages.add(message);
	console.warn(message);
}
function isPreflightRequest(event) {
	const origin = event.req.headers.get("origin");
	const accessControlRequestMethod = event.req.headers.get("access-control-request-method");
	return event.req.method === "OPTIONS" && !!origin && !!accessControlRequestMethod;
}
function appendCorsPreflightHeaders(event, options) {
	const headerGroups = [
		createOriginHeaders(event, options),
		createCredentialsHeaders(options),
		createMethodsHeaders(event, options),
		createAllowHeaderHeaders(event, options),
		createMaxAgeHeader(options)
	];
	const headers = Object.assign({}, ...headerGroups);
	const varyValues = headerGroups.map((group) => group.vary).filter(Boolean);
	if (varyValues.length > 0) headers.vary = varyValues.join(", ");
	setCorsHeaders(event, headers);
}
function appendCorsHeaders(event, options) {
	setCorsHeaders(event, {
		...createOriginHeaders(event, options),
		...createCredentialsHeaders(options),
		...createExposeHeaders(options)
	});
}
function setCorsHeaders(event, headers) {
	for (const [key, value] of Object.entries(headers)) if (key === "vary") {
		event.res.headers.append(key, value);
		event.res.errHeaders.append(key, value);
	} else {
		event.res.headers.set(key, value);
		event.res.errHeaders.set(key, value);
	}
}
function handleCors(event, options) {
	const _options = resolveCorsOptions(options);
	if (isPreflightRequest(event)) {
		appendCorsPreflightHeaders(event, _options);
		return noContent(_options.preflight.statusCode);
	}
	appendCorsHeaders(event, _options);
	return false;
}
async function getRequestFingerprint(event, opts = {}) {
	const fingerprint = [];
	if (opts.ip !== false) fingerprint.push(getRequestIP(event, { xForwardedFor: opts.xForwardedFor }));
	if (opts.method === true) fingerprint.push(event.req.method);
	if (opts.url === true) fingerprint.push(event.req.url);
	if (opts.userAgent === true) fingerprint.push(event.req.headers.get("user-agent"));
	const fingerprintString = fingerprint.filter(Boolean).join("|");
	if (!fingerprintString) return null;
	if (opts.hash === false) return fingerprintString;
	const buffer = await crypto.subtle.digest(opts.hash || "SHA-1", new TextEncoder().encode(fingerprintString));
	return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function getRequestHeader(event, name) {
	return event.req.headers.get(name) || void 0;
}
function getRequestHeaders(event) {
	return Object.fromEntries(event.req.headers.entries());
}
var FETCH_EVENT_CONTEXT = "solidFetchEvent";
function createFetchEvent(event) {
	return {
		request: event.req,
		response: event.res,
		clientAddress: getRequestIP(event),
		locals: {},
		nativeEvent: event
	};
}
function getFetchEvent(h3Event) {
	if (!h3Event.context[FETCH_EVENT_CONTEXT]) {
		const fetchEvent = createFetchEvent(h3Event);
		h3Event.context[FETCH_EVENT_CONTEXT] = fetchEvent;
	}
	return h3Event.context[FETCH_EVENT_CONTEXT];
}
function mergeResponseHeaders(h3Event, headers) {
	for (const [key, value] of headers.entries()) h3Event.res.headers.append(key, value);
}
/**
* Wrap an h3 event handler so Solid's request context is available while it runs.
*
* @experimental
*/
var decorateHandler = (fn) => (event) => provideRequestEvent(getFetchEvent(event), () => fn(event));
/**
* Wrap h3 middleware so Solid's request context is available while it runs.
*
* @experimental
*/
var decorateMiddleware = (fn) => (event, next) => provideRequestEvent(getFetchEvent(event), () => fn(event, next));
var _solid_start_middleware_default = {};
var COOKIE_MAX_AGE_LIMIT = 3456e4;
var maxAgeRegExp = /^-?\d+$/;
var _nullProto = /* @__PURE__ */ Object.getPrototypeOf({});
function parseSetCookie(str, options) {
	const len = str.length;
	let _endIdx = len;
	let eqIdx = -1;
	for (let i = 0; i < len; i++) {
		const c = str.charCodeAt(i);
		if (c === 59) {
			_endIdx = i;
			break;
		}
		if (c === 61 && eqIdx === -1) eqIdx = i;
	}
	if (eqIdx >= _endIdx) eqIdx = -1;
	const name = eqIdx === -1 ? "" : _trim(str, 0, eqIdx);
	if (name && name in _nullProto) return void 0;
	let value = eqIdx === -1 ? _trim(str, 0, _endIdx) : _trim(str, eqIdx + 1, _endIdx);
	if (!name && !value) return void 0;
	if (name.length + value.length > 4096) return void 0;
	if (options?.decode !== false) value = _decode(value, options?.decode);
	const setCookie = {
		name,
		value
	};
	let index = _endIdx + 1;
	while (index < len) {
		let endIdx = len;
		let attrEqIdx = -1;
		for (let i = index; i < len; i++) {
			const c = str.charCodeAt(i);
			if (c === 59) {
				endIdx = i;
				break;
			}
			if (c === 61 && attrEqIdx === -1) attrEqIdx = i;
		}
		if (attrEqIdx >= endIdx) attrEqIdx = -1;
		const attr = attrEqIdx === -1 ? _trim(str, index, endIdx) : _trim(str, index, attrEqIdx);
		const val = attrEqIdx === -1 ? void 0 : _trim(str, attrEqIdx + 1, endIdx);
		if (val === void 0 || val.length <= 1024) switch (attr.toLowerCase()) {
			case "httponly":
				setCookie.httpOnly = true;
				break;
			case "secure":
				setCookie.secure = true;
				break;
			case "partitioned":
				setCookie.partitioned = true;
				break;
			case "domain":
				if (val) setCookie.domain = (val.charCodeAt(0) === 46 ? val.slice(1) : val).toLowerCase();
				break;
			case "path":
				setCookie.path = val;
				break;
			case "max-age":
				if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT);
				break;
			case "expires": {
				if (!val) break;
				const date = new Date(val);
				if (Number.isFinite(date.valueOf())) {
					const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT * 1e3);
					setCookie.expires = date > maxDate ? maxDate : date;
				}
				break;
			}
			case "priority": {
				if (!val) break;
				const priority = val.toLowerCase();
				if (priority === "low" || priority === "medium" || priority === "high") setCookie.priority = priority;
				break;
			}
			case "samesite": {
				if (!val) break;
				const sameSite = val.toLowerCase();
				if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") setCookie.sameSite = sameSite;
				else setCookie.sameSite = "lax";
				break;
			}
			default: {
				const attrLower = attr.toLowerCase();
				if (attrLower && !(attrLower in _nullProto)) setCookie[attrLower] = val;
			}
		}
		index = endIdx + 1;
	}
	return setCookie;
}
function _trim(str, start, end) {
	if (start === end) return "";
	let s = start;
	let e = end;
	while (s < e && (str.charCodeAt(s) === 32 || str.charCodeAt(s) === 9)) s++;
	while (e > s && (str.charCodeAt(e - 1) === 32 || str.charCodeAt(e - 1) === 9)) e--;
	return str.slice(s, e);
}
function _decode(value, decode) {
	if (!decode && !value.includes("%")) return value;
	try {
		return (decode || decodeURIComponent)(value);
	} catch {
		return value;
	}
}
var REGISTRATIONS = /* @__PURE__ */ new Map();
function getServerFunction(id) {
	const fn = REGISTRATIONS.get(id);
	if (fn) return fn;
	throw new Error("invalid server function: " + id);
}
async function applyServerFunctionErrorHandler(thrown) {
	try {
		return await void 0 ?? thrown;
	} catch {
		return thrown;
	}
}
var validRedirectStatuses = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
function getExpectedRedirectStatus(response) {
	if (response.status && validRedirectStatuses.has(response.status)) return response.status;
	return 302;
}
async function handleServerFunction(h3Event) {
	const event = getFetchEvent(h3Event);
	const request = event.request;
	const serverReference = request.headers.get("X-Server-Id");
	const instance = request.headers.get("X-Server-Instance");
	const singleFlight = request.headers.has("X-Single-Flight");
	const url = new URL(request.url);
	let functionId;
	if (serverReference) [functionId] = serverReference.split("#");
	else {
		functionId = url.searchParams.get("id");
		if (!functionId) return new Response(null, { status: 404 });
	}
	const serverFunction = getServerFunction(functionId);
	let parsed = [];
	if (!instance || request.method === "GET") {
		const args = url.searchParams.get("args");
		if (args) {
			const result = await deserializeFromJSONString(args);
			for (const arg of result) parsed.push(arg);
		}
	}
	if (request.method === "POST" && request.body !== null) {
		const bodyFormat = request.headers.get(BODY_FORMAT_KEY);
		const decoded = await extractBody("", false, request.clone());
		if (bodyFormat === BodyFormat.Seroval) parsed = decoded;
		else parsed.push(decoded);
	}
	try {
		let result = await provideRequestEvent(event, async () => {
			sharedConfig.context = { event };
			event.locals.serverFunctionMeta = { id: functionId };
			return serverFunction(...parsed);
		});
		if (singleFlight && instance) result = await handleSingleFlight(event, result);
		if (result instanceof Response) {
			if (result.headers && result.headers.has("X-Content-Raw")) return result;
			if (instance) {
				if (result.headers) mergeResponseHeaders(h3Event, result.headers);
				if (result.status && (result.status < 300 || result.status >= 400)) h3Event.res.status = result.status;
				if (result.customBody) result = await result.customBody();
				else if (result.body == null) result = null;
			}
		}
		if (!instance) return await handleNoJS(result, request, parsed);
		const body = getHeadersAndBody(result);
		if (body) return new Response(body.body, { headers: body.headers });
		h3Event.res.headers.set(BODY_FORMAT_KEY, BodyFormat.Seroval);
		return serializeToJSONStream(result);
	} catch (x) {
		x = await applyServerFunctionErrorHandler(x);
		if (x instanceof Response) {
			if (singleFlight && instance) x = await handleSingleFlight(event, x);
			if (x.headers) mergeResponseHeaders(h3Event, x.headers);
			if (x.status && (!instance || x.status < 300 || x.status >= 400)) h3Event.res.status = x.status;
			if (x.customBody) x = await x.customBody();
			else if (x.body == null) x = null;
			h3Event.res.headers.set("X-Error", "true");
		} else if (instance) {
			const error = x instanceof Error ? x.message : typeof x === "string" ? x : "true";
			h3Event.res.headers.set("X-Error", toHeaderValue(error));
		} else x = await handleNoJS(x, request, parsed, true);
		if (instance) {
			const body = getHeadersAndBody(x);
			if (body) {
				const headers = new Headers(body.headers);
				const errorHeader = h3Event.res.headers.get("X-Error");
				if (errorHeader !== null) headers.set("X-Error", errorHeader);
				return new Response(body.body, { headers });
			}
			h3Event.res.headers.set(BODY_FORMAT_KEY, BodyFormat.Seroval);
			return serializeToJSONStream(x);
		}
		return x;
	}
}
function toHeaderValue(value) {
	const stripped = value.replace(/[\r\n]+/g, "");
	try {
		return /[^\x00-\xFF]/.test(stripped) ? encodeURIComponent(stripped) : stripped;
	} catch {
		return "true";
	}
}
function getRefererLocation(request, url) {
	const referer = request.headers.get("referer");
	try {
		if (referer) return new URL(referer).toString();
	} catch {}
	return new URL("/", url.origin).toString();
}
async function handleNoJS(result, request, parsed, thrown) {
	const url = new URL(request.url);
	const isError = result instanceof Error;
	let statusCode = 302;
	let headers;
	if (result instanceof Response) {
		headers = new Headers(result.headers);
		if (result.headers.has("Location")) {
			headers.set(`Location`, new URL(result.headers.get("Location"), url.origin + "/").toString());
			statusCode = getExpectedRedirectStatus(result);
		} else headers.set("Location", getRefererLocation(request, url));
		headers.delete("Content-Type");
		result = result.customBody ? await result.customBody() : null;
	} else headers = new Headers({ Location: getRefererLocation(request, url) });
	if (result) headers.append("Set-Cookie", `flash=${encodeURIComponent(JSON.stringify({
		url: url.pathname + url.search,
		result: isError ? result.message : result,
		thrown,
		error: isError,
		input: parsed.length ? [...parsed.slice(0, -1), [...parsed[parsed.length - 1].entries()]] : []
	}))}; Secure; HttpOnly;`);
	return new Response(null, {
		status: statusCode,
		headers
	});
}
var App;
function createSingleFlightHeaders(sourceEvent, result) {
	const headers = new Headers(sourceEvent.request.headers);
	const cookies = parseCookies(sourceEvent.nativeEvent);
	const SetCookies = sourceEvent.response.headers.getSetCookie();
	if (result instanceof Response) SetCookies.push(...result.headers.getSetCookie());
	headers.delete("cookie");
	SetCookies.forEach((cookie) => {
		if (!cookie) return;
		const parsed = parseSetCookie(cookie);
		if (!parsed) return;
		const { maxAge, expires, name, value } = parsed;
		if (maxAge != null && maxAge <= 0) {
			delete cookies[name];
			return;
		}
		if (expires != null && expires.getTime() <= Date.now()) {
			delete cookies[name];
			return;
		}
		cookies[name] = value;
	});
	Object.entries(cookies).forEach(([key, value]) => {
		headers.append("cookie", `${key}=${value}`);
	});
	return headers;
}
async function handleSingleFlight(sourceEvent, result) {
	let revalidate;
	let url = new URL(sourceEvent.request.headers.get("referer")).toString();
	if (result instanceof Response) {
		if (result.headers.has("X-Revalidate")) revalidate = result.headers.get("X-Revalidate").split(",");
		if (result.headers.has("Location")) url = new URL(result.headers.get("Location"), new URL(sourceEvent.request.url).origin + "/").toString();
	}
	const event = { ...sourceEvent };
	event.request = new Request(url, { headers: createSingleFlightHeaders(sourceEvent, result) });
	return await provideRequestEvent(event, async () => {
		await createPageEvent(event);
		App || (App = (await Promise.resolve().then(() => app_exports)).default);
		event.router.dataOnly = revalidate || true;
		event.router.previousUrl = sourceEvent.request.headers.get("referer");
		try {
			renderToString(() => {
				sharedConfig.context.event = event;
				App();
			});
		} catch (e) {
			console.log(e);
		}
		const body = event.router.data;
		if (!body) return result;
		let containsKey = false;
		for (const key in body) if (body[key] === void 0) delete body[key];
		else containsKey = true;
		if (!containsKey) return result;
		if (!(result instanceof Response)) {
			body["_$value"] = result;
			result = new Response(null, { status: 200 });
		} else if (result.customBody) body["_$value"] = result.customBody();
		result.customBody = () => body;
		result.headers.set("X-Single-Flight", "true");
		return result;
	});
}
/** Convert Solid's streaming SSR result into a cancellation-safe web stream. */
function toWebReadableStream(stream) {
	const encoder = new TextEncoder();
	let active = true;
	return new ReadableStream({
		start(controller) {
			stream.pipe({
				write(payload) {
					if (!active) return;
					controller.enqueue(encoder.encode(payload));
				},
				end() {
					if (!active) return;
					active = false;
					controller.close();
				}
			});
		},
		cancel() {
			active = false;
		}
	});
}
function stripPathBase(path, base) {
	if (!base || base === "/") return path;
	const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
	if (path === normalizedBase) return "/";
	if (path.startsWith(`${normalizedBase}/`)) return path.slice(normalizedBase.length);
	return path;
}
var SERVER_FN_BASE = "/_server";
function createBaseHandler(createPageEvent, fn, options = {}, routerLoad) {
	const handler = defineHandler({
		middleware: _solid_start_middleware_default.length ? _solid_start_middleware_default.map(decorateMiddleware) : void 0,
		handler: decorateHandler(async (e) => {
			const event = getRequestEvent();
			const pathname = stripBaseUrl(new URL(event.request.url).pathname);
			if (pathname.startsWith(SERVER_FN_BASE)) return await handleServerFunction(e);
			const match = matchAPIRoute(pathname, event.request.method);
			if (match) {
				const mod = await match.handler.import();
				const fn = event.request.method === "HEAD" ? mod["HEAD"] || mod["GET"] : mod[event.request.method];
				if (typeof fn === "function") {
					event.params = match.params || {};
					sharedConfig.context = { event };
					const res = await fn(event);
					if (res !== void 0) return res;
					if (event.request.method !== "GET") throw new Error(`API handler for ${event.request.method} "${event.request.url}" did not return a response.`);
					if (!match.isPage) return;
				}
			}
			if (routerLoad) await routerLoad(event);
			const context = await createPageEvent(event);
			const resolvedOptions = typeof options === "function" ? await options(context) : { ...options };
			const mode = resolvedOptions.mode || "stream";
			if (resolvedOptions.nonce) context.nonce = resolvedOptions.nonce;
			if (mode === "sync" || false) {
				const html = renderToString(() => {
					sharedConfig.context.event = context;
					return fn(context);
				}, resolvedOptions);
				context.complete = true;
				if (context.response && context.response.headers.get("Location")) {
					const status = getExpectedRedirectStatus(context.response);
					return redirect(context.response.headers.get("Location"), status);
				}
				event.response.headers.set("content-type", "text/html");
				return html;
			}
			if (resolvedOptions.onCompleteAll) {
				const og = resolvedOptions.onCompleteAll;
				resolvedOptions.onCompleteAll = (options) => {
					handleStreamCompleteRedirect(context)(options);
					og(options);
				};
			} else resolvedOptions.onCompleteAll = handleStreamCompleteRedirect(context);
			if (resolvedOptions.onCompleteShell) {
				const og = resolvedOptions.onCompleteShell;
				resolvedOptions.onCompleteShell = (options) => {
					handleShellCompleteRedirect(context, e)();
					og(options);
				};
			} else resolvedOptions.onCompleteShell = handleShellCompleteRedirect(context, e);
			const stream = renderToStream(() => {
				sharedConfig.context.event = context;
				return fn(context);
			}, resolvedOptions);
			if (context.response && context.response.headers.get("Location")) {
				const status = getExpectedRedirectStatus(context.response);
				return redirect(context.response.headers.get("Location"), status);
			}
			if (mode === "async") return await stream;
			return iterable(toWebReadableStream(stream));
		})
	});
	const app = new H3();
	app.use(handler);
	return app;
}
function createHandler(fn, options = {}, routerLoad) {
	return createBaseHandler(createPageEvent, fn, options, routerLoad);
}
async function createPageEvent(ctx) {
	ctx.response.headers.set("Content-Type", "text/html");
	const manifest = getSsrManifest("client");
	const assets = [
		...await manifest.getAssets("style.css"),
		...await manifest.getAssets("./src/entry-client.tsx"),
		...await manifest.getAssets("/home/shiro/project/style-this/examples/vite-solid-start-2/src/app.tsx")
	];
	return Object.assign(ctx, {
		assets,
		router: { submission: initFromFlash(ctx) },
		routes: createRoutes(),
		complete: false,
		$islands: /* @__PURE__ */ new Set()
	});
}
function initFromFlash(ctx) {
	const flash = getCookie(ctx.nativeEvent, "flash");
	if (!flash) return;
	try {
		const param = JSON.parse(flash);
		if (!param || !param.result) return;
		const input = [...param.input.slice(0, -1), new Map(param.input[param.input.length - 1])];
		const result = param.error ? new Error(param.result) : param.result;
		return {
			input,
			url: param.url,
			pending: false,
			result: param.thrown ? void 0 : result,
			error: param.thrown ? result : void 0
		};
	} catch (e) {
		console.error(e);
	} finally {
		setCookie(ctx.nativeEvent, "flash", "", { maxAge: 0 });
	}
}
function handleShellCompleteRedirect(context, e) {
	return () => {
		if (context.response && context.response.headers.get("Location")) {
			const status = getExpectedRedirectStatus(context.response);
			e.res.status = status;
			e.res.headers.set("Location", context.response.headers.get("Location"));
		}
	};
}
function handleStreamCompleteRedirect(context) {
	return ({ write }) => {
		context.complete = true;
		const to = context.response && context.response.headers.get("Location");
		if (!to) return;
		write(`<script${context.nonce ? ` nonce="${escapeAttribute(context.nonce)}"` : ""}>window.location=${JSON.stringify(to).replace(/</g, "\\u003c")}<\/script>`);
	};
}
function escapeAttribute(value) {
	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function stripBaseUrl(path) {
	return stripPathBase(path, "/");
}
/**
* Checks if user has set a redirect status in the response.
* If not, falls back to the 302 (temporary redirect)
*/
var _tmpl$ = ["<head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link rel=\"icon\" href=\"/favicon.ico\">", "</head>"];
var _tmpl$2 = [
	"<html",
	" lang=\"en\">",
	"<body><div id=\"app\" class=\"AppWrapper-12rw9u\">",
	"</div><!--$-->",
	"<!--/--></body></html>"
];
var entry_server_default = createHandler(() => createComponent(StartServer, { document: ({ assets, children, scripts }) => ssr(_tmpl$2, ssrHydrationKey(), createComponent(NoHydration, { get children() {
	return ssr(_tmpl$, escape(assets));
} }), escape(children), escape(scripts)) }));
//#endregion
export { readValidatedBody as A, handleCacheHeaders as C, parseCookies as D, isPreflightRequest as E, useSession as F, HttpStatusCode as I, Title as L, setCookie as M, unsealSession as N, proxyRequest as O, updateSession as P, getValidatedRouterParams as S, isMethod as T, getRequestURL as _, clearSession as a, getSession as b, getCookie as c, getRequestFingerprint as d, entry_server_default as default, getRequestHeader as f, getRequestProtocol as g, getRequestIP as h, assertMethod as i, sealSession as j, readBody as k, getProxyRequestHeaders as l, getRequestHost as m, appendCorsHeaders as n, deleteCookie as o, getRequestHeaders as p, appendCorsPreflightHeaders as r, fetchWithEvent as s, H3Event as t, getQuery as u, getRouterParam as v, handleCors as w, getValidatedQuery as x, getRouterParams as y };
