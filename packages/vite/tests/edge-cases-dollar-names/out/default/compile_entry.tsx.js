// /packages/vite/tests/edge-cases-dollar-names/entry.tsx: {"$Global", "$btn", "css", "wrapper"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let $btn = new String("__btn-cxef81");
$btn.css = `color: red;`;
let $Global = new String("__Global-8tarcl");
$Global.css = `color: green;`;
let wrapper = new String("wrapper-ol6bkd");
wrapper.css = `.${$btn} {
    color: blue;
  }`;

global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-dollar-names/entry.tsx"] = {...(global.__styleThis_value_cache_ggghhhii["/packages/vite/tests/edge-cases-dollar-names/entry.tsx"] ?? {}), $btn};return [
`.__btn-cxef81 {
${$btn.css}
}`,
`.__Global-8tarcl {
${$Global.css}
}`,
`.wrapper-ol6bkd {
${wrapper.css}
}`
];
