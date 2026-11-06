// /packages/vite/tests/multi-2/b.tsx (/packages/vite/tests/multi-2/entry.tsx): {"color", "css", "exported", "originalColor"}
"use strict";
const originalColor = __styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/b.tsx: {"color", "css", "exported", "originalColor"}
"use strict";
const originalColor = __styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};return {
"exported": exported.css
};


// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"color", "css", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"color", "css", "exported"} #2
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"]['color'];
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/entry.tsx: {"a", "color", "css"}
"use strict";
const color = __styleThis_value_cache_ggghhhii["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-k1mv0l");
a.css = `background: ${color};`;
return {
"a": a.css
};
