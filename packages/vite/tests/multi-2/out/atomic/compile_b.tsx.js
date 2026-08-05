// /packages/vite/tests/multi-1/b.tsx (/packages/vite/tests/multi-1/entry.tsx): {"color", "exported", "css"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "red";
let exported = new String("exported-w5y7wh");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-1/b.tsx: {"css", "color", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]['color'];
let exported = new String("exported-w5y7wh");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-w5y7wh',start:87,end:117}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/b.tsx.css').resolve([
`.exported-w5y7wh {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-1/b.tsx.css');


// /packages/vite/tests/multi-1/b.tsx: {"css", "exported", "color"}
const exported = new String('exported-w5y7wh');
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]['color'];
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"] ?? {}), color};// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!exported.css) { console.error('[atomic] exported.css is undefined'); exported.css = ''; }
const _exported_atomic = cssToAtomicClassList(exported.css);

const cssSourcemapData = [{className:'exported-w5y7wh',start:87,end:117}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.exported-w5y7wh {\n${extractNonAtomicCss(exported.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/b.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/multi-1/b.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_exported = "' + 'exported-w5y7wh' + ' ' + _exported_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/b.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/multi-1/entry.tsx: {"a", "css", "color"}
const a = new String('a-8pm3ch');
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
a.css = `background: ${color};`;
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

const cssSourcemapData = [{className:'a-8pm3ch',start:80,end:110}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-8pm3ch {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/multi-1/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-8pm3ch' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/multi-1/entry.tsx: {"css", "color", "a"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-1/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-8pm3ch");
a.css = `background: ${color};`;
const cssSourcemapData = [{className:'a-8pm3ch',start:80,end:110}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-1/entry.tsx.css').resolve([
`.a-8pm3ch {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-1/entry.tsx.css');


// /packages/vite/tests/multi-2/b.tsx (/packages/vite/tests/multi-2/entry.tsx): {"color", "originalColor", "exported", "css"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = "hot" + originalColor;
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/b.tsx: {"css", "exported", "color", "originalColor"}
const exported = new String('exported-ev01qj');
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]['color'];
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};// Import atomic CSS helpers from wasm
const cssToAtomicClassList = global.__styleThis_cssToAtomicClassList;
const extractNonAtomicCss = global.__styleThis_extractNonAtomicCss;
if (!cssToAtomicClassList) {
    throw new Error('cssToAtomicClassList not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}
if (!extractNonAtomicCss) {
    throw new Error('extractNonAtomicCss not found on global. Available: ' + Object.keys(global).filter(k => k.includes('styleThis')).join(', '));
}

// Convert CSS to atomic class lists
if (!exported.css) { console.error('[atomic] exported.css is undefined'); exported.css = ''; }
const _exported_atomic = cssToAtomicClassList(exported.css);

const cssSourcemapData = [{className:'exported-ev01qj',start:149,end:179}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.exported-ev01qj {\n${extractNonAtomicCss(exported.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/b.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/multi-2/b.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_exported = "' + 'exported-ev01qj' + ' ' + _exported_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/b.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/multi-2/b.tsx: {"exported", "css", "originalColor", "color"}
"use strict";
const originalColor = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]['color'];
let exported = new String("exported-ev01qj");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-ev01qj',start:149,end:179}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/b.tsx.css').resolve([
`.exported-ev01qj {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/b.tsx.css');


// /packages/vite/tests/multi-2/c.tsx (/packages/vite/tests/multi-2/b.tsx): {"css", "color", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = "pink";
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};

// /packages/vite/tests/multi-2/c.tsx: {"css", "color", "exported"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let color = global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"]['color'];
let exported = new String("exported-4lyf89");
exported.css = `background: ${color};`;

global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] = {...(global.__styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/c.tsx"] ?? {}), color};const cssSourcemapData = [{className:'exported-4lyf89',start:88,end:118}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/c.tsx.css').resolve([
`.exported-4lyf89 {
${exported.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/c.tsx.css');


// /packages/vite/tests/multi-2/entry.tsx: {"a", "css", "color"}
const a = new String('a-k1mv0l');
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
a.css = `background: ${color};`;
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

const cssSourcemapData = [{className:'a-k1mv0l',start:80,end:110}];

// In atomic mode, resolve per-file CSS with marker classes for sourcemaps
// The actual atomic CSS goes into the .atomic.css file via explicit import
const perFileCss = [`.a-k1mv0l {\n${extractNonAtomicCss(a.css)||'/* atomized */'}\n}`].join('\n');
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/entry.tsx.css').resolve(perFileCss, cssSourcemapData, '/packages/vite/tests/multi-2/entry.tsx.css');

// Generate and resolve the .style-this.js module
const styleThisModule = 'export const _styleThis_a = "' + 'a-k1mv0l' + ' ' + _a_atomic + '";';
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/entry.tsx.style-this.js').resolve(styleThisModule);


// /packages/vite/tests/multi-2/entry.tsx: {"color", "a", "css"}
"use strict";
const color = __styleThis_vars_aabbbccc["/packages/vite/tests/multi-2/b.tsx"]["color"];
let { css } = require("/packages/core/dist/index.mjs");
let a = new String("a-k1mv0l");
a.css = `background: ${color};`;
const cssSourcemapData = [{className:'a-k1mv0l',start:80,end:110}];
global.__styleThis_css_aabbbccc.get('/packages/vite/tests/multi-2/entry.tsx.css').resolve([
`.a-k1mv0l {
${a.css}
}`
].join('\n'), cssSourcemapData, '/packages/vite/tests/multi-2/entry.tsx.css');
