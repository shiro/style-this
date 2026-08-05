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


// /packages/vite/tests/edge-cases-1/entry-2.tsx: {"css", "num", "b"}
const b = new String('b-w56741');
"use strict";
const num = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]["num"];
let { css } = require("/packages/core/dist/index.mjs");
b.css = `margin: ${num}px;`;
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
if (!b.css) { console.error('[atomic] b.css is undefined'); b.css = ''; }
const _b_atomic = cssToAtomicClassList(b.css);

const cssSourcemapData = [{className:'b-w56741',start:83,end:109}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.b-w56741 {\n${extractNonAtomicCss(b.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-2.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/edge-cases-1/entry-2.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_b = "' + 'b-w56741' + ' ' + _b_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/entry-2.tsx.style-this.js').resolve(styleThisModule);


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


// /packages/vite/tests/edge-cases-1/shared.tsx: {"shared", "num", "Math", "css"}
const shared = new String('shared-ar0tez');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let num = global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"]['num'];
shared.css = `margin: ${num}px;`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-1/shared.tsx"] ?? {}), num};// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!shared.css) { console.error('[atomic] shared.css is undefined'); shared.css = ''; }
const _shared_atomic = cssToAtomicClassList(shared.css);

const cssSourcemapData = [{className:'shared-ar0tez',start:91,end:117}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.shared-ar0tez {\n${extractNonAtomicCss(shared.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/shared.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/edge-cases-1/shared.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_shared = "' + 'shared-ar0tez' + ' ' + _shared_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-1/shared.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/edge-cases-library-imports/entry.tsx: {"getNumber", "css", "a"}
"use strict";
const getNumber = __styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"]["getNumber"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-tej8d6");
a.css = `margin: ${getNumber()};`;
const cssSourcemapData = [{className:'a-tej8d6',start:627,end:659}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/edge-cases-library-imports/entry.tsx.css').resolve([
`.a-tej8d6 {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/edge-cases-library-imports/entry.tsx.css');


// /packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js (/packages/vite/tests/edge-cases-library-imports/entry.tsx): {"getNumber"}
"use strict";
let getNumber = () => 99;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/edge-cases-library-imports/node_modules/some_lib/index.js"] ?? {}), getNumber};