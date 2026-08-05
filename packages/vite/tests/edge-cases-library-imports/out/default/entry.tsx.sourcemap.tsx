// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/edge-cases-library-imports/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/edge-cases-library-imports/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport { getNumber } from \"some_lib\";\n// const someLib = require(\"vite\");\n// const someLib = require(\"some_lib\");\n// const someLib = require(\"../../src/viteTests/edge-cases-library-imports/node_modules/some_lib/index\");\n// const someLib = require(\"/home/shiro/project/stylistic/src/viteTests/edge-cases-library-imports/node_modules/some_lib/index.js\");\n// const someLib = require(\"some_lib/index.js\");\n// const someLib = require(\"../../src/viteTests/edge-cases-library-imports/hi.js\");\n\n// const { getNumber } = someLib;\n// const { getNumber } = require(\"some_lib/index.js\");\n\nconst a = css`\n  margin: ${getNumber()};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAYU"
// }

import { css } from "@style-this/core";
import { getNumber } from "some_lib";
// const someLib = require("vite");
// const someLib = require("some_lib");
// const someLib = require("../../src/viteTests/edge-cases-library-imports/node_modules/some_lib/index");
// const someLib = require("/home/shiro/project/stylistic/src/viteTests/edge-cases-library-imports/node_modules/some_lib/index.js");
// const someLib = require("some_lib/index.js");
// const someLib = require("../../src/viteTests/edge-cases-library-imports/hi.js");

// const { getNumber } = someLib;
// const { getNumber } = require("some_lib/index.js");

const a = css`
  margin: ${getNumber()};
`;
