// /packages/vite/tests/atomic-global-1/entry.tsx: {"_GlobalMain", "css", "mainStyle"}
"use strict";
let { css } = require("/packages/core/dist/index.mjs");
let mainStyle = new String("");
mainStyle.css = `background: red;
  padding: 20px;`;
let _GlobalMain = new String("");
_GlobalMain.css = `.Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }`;
return {
"mainStyle": mainStyle.css,
"_GlobalMain": _GlobalMain.css
};
