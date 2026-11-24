// /packages/vite/tests/reexports-2/b.ts (/packages/vite/tests/reexports-2/entry.tsx): {"__styleThis_reexport_palette", "__styleThis_star_namespace_0", "__styleThis_star_namespace_1", "__styleThis_star_reexport_0", "__styleThis_star_reexport_1", "own", "palette", "primary", "secondary", "tokens"}
"use strict";
const __styleThis_reexport_palette = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/palette.ts"];
const __styleThis_star_namespace_1 = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"];
const __styleThis_star_namespace_0 = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/c.ts"];
const tokens = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"];
let own = "white";
const __styleThis_star_reexport_1 = __styleThis_star_namespace_0?.["secondary"] ?? __styleThis_star_namespace_1?.["secondary"];
const __styleThis_star_reexport_0 = __styleThis_star_namespace_0?.["primary"] ?? __styleThis_star_namespace_1?.["primary"];

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"] ?? {}), "palette": __styleThis_reexport_palette,"primary": __styleThis_star_reexport_0,"secondary": __styleThis_star_reexport_1,own,tokens};

// /packages/vite/tests/reexports-2/c.ts (/packages/vite/tests/reexports-2/b.ts): {"base", "primary", "secondary"}
"use strict";
const base = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"]["base"];
let primary = `dark${base}`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/c.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/c.ts"] ?? {}), primary};

// /packages/vite/tests/reexports-2/d.ts (/packages/vite/tests/reexports-2/b.ts): {"__star__", "accent", "base", "primary", "secondary"}
"use strict";
let base = "red";
let secondary = "blue";
let accent = "green";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] ?? {}), accent,base,secondary};

// /packages/vite/tests/reexports-2/d.ts (/packages/vite/tests/reexports-2/c.ts): {}
"use strict";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] ?? {}), };

// /packages/vite/tests/reexports-2/d.ts (/packages/vite/tests/reexports-2/palette.ts): {}
"use strict";

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"] ?? {}), };

// /packages/vite/tests/reexports-2/entry.tsx: {"Object", "Record", "box", "css", "own", "palette", "primary", "scale", "secondary", "sizes", "tokens", "total"}
"use strict";
const sizes = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/sizes.ts"];
const tokens = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"]["tokens"];
const palette = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"]["palette"];
const own = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"]["own"];
const secondary = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"]["secondary"];
const primary = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/b.ts"]["primary"];
let { css } = require("/packages/core/dist/index.mjs");
let scale = 2;
let total = (values) => Object.values(values).reduce((a, b) => a + b);
let box = new String("box-wt6b8t");
box.css = `color: ${primary};
  background: ${secondary};
  border-color: ${own};
  outline-color: ${palette.accent};
  caret-color: ${palette.secondary};
  text-decoration-color: ${tokens.base};
  width: ${scale * 10}px;
  padding: ${total(sizes)}px;`;
return [
`.box-wt6b8t {
${box.css}
}`
].join('\n');


// /packages/vite/tests/reexports-2/palette.ts (/packages/vite/tests/reexports-2/b.ts): {"__star__", "__styleThis_star_namespace_0", "__styleThis_star_reexport_0", "secondary"}
"use strict";
const __styleThis_star_namespace_0 = __styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/d.ts"];
let secondary = "navy";
const __styleThis_star_reexport_0 = { ...__styleThis_star_namespace_0 };

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/palette.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/palette.ts"] ?? {}), ...__styleThis_star_reexport_0,secondary};

// /packages/vite/tests/reexports-2/sizes.ts (/packages/vite/tests/reexports-2/entry.tsx): {"__star__", "gap", "radius"}
"use strict";
let gap = 4;
let radius = 2;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/sizes.ts"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/reexports-2/sizes.ts"] ?? {}), gap,radius};