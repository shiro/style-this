// /packages/vite/tests/atomic-global-1/entry.tsx: {"_GlobalMain", "css", "mainStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let mainStyle = new String("mainStyle-74hqzc");
mainStyle.css = `background: red;
  padding: 20px;`;
let _GlobalMain = new String("_GlobalMain");
_GlobalMain.css = `.Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }`;
const cssSourcemapData = [{className:'mainStyle-74hqzc',start:110,end:152},{className:'_GlobalMain',start:211,end:367}];
global.__styleThis_css_cache_aabbbccc.get('/packages/vite/tests/atomic-global-1/entry.tsx.css')?.resolve([
`.mainStyle-74hqzc {
${mainStyle.css}
}`,
`${_GlobalMain.css}
`
].join('\n'), cssSourcemapData, '/packages/vite/tests/atomic-global-1/entry.tsx.css');
