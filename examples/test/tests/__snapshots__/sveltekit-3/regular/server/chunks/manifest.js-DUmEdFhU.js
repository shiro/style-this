const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Du92VNGb.js",app:"_app/immutable/entry/app.CVripF8v.js",imports:["_app/immutable/entry/start.Du92VNGb.js","_app/immutable/chunks/xaa-1KUO.js","_app/immutable/chunks/C-fJR1k7.js","_app/immutable/entry/app.CVripF8v.js","_app/immutable/chunks/C-fJR1k7.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js-06T9gvP2.js')),
			__memo(() => import('./nodes/1.js-1BZZfEmd.js')),
			__memo(() => import('./nodes/2.js-DvWJkLBf.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export { manifest as m };
//# sourceMappingURL=manifest.js-DUmEdFhU.js.map
