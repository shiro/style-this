// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"css", "num", "a"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-gxu385");
a.css = `margin: ${num}px;`;
const cssSourcemapData = [{className:'a-gxu385',start:83,end:109}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.css').resolve([
`.a-gxu385 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-1.tsx.css');


// /packages/vite/tests/edge-cases-1/entry-1.tsx: {"num", "css", "a"}
const a = new String('a-gxu385');
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
a.css = `margin: ${num}px;`;
// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!a.css) { console.error('[atomic] a.css is undefined'); a.css = ''; }
const _a_atomic = cssToAtomicClassList(a.css);

const cssSourcemapData = [{className:'a-gxu385',start:83,end:109}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-gxu385 {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-1.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-gxu385' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-1.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/edge-cases-1/entry-2.tsx: {"b", "css", "num"}
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
let b = new String("b-w56741");
b.css = `margin: ${num}px;`;
const cssSourcemapData = [{className:'b-w56741',start:83,end:109}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-2.tsx.css').resolve([
`.b-w56741 {
${b.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-2.tsx.css');


// /packages/vite/tests/edge-cases-1/shared.tsx (/packages/vite/tests/edge-cases-1/entry-1.tsx): {"num", "shared", "css", "Math"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = Math.random();
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};

// /packages/vite/tests/edge-cases-1/shared.tsx: {"css", "Math", "shared", "num"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
let shared = new String("shared-ar0tez");
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};const cssSourcemapData = [{className:'shared-ar0tez',start:91,end:117}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/shared.tsx.css').resolve([
`.shared-ar0tez {
${shared.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-1/shared.tsx.css');
