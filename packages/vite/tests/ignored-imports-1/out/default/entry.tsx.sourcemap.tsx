// {
//   "version": 3,
//   "file": "/packages/vite/tests/ignored-imports-1/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/ignored-imports-1/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\nimport store, { color as accent, track as trackEvent } from \"./lib\";\nimport { open } from \"./browser\";\n\n// references the ignored imports without calling them during evaluation\nconst getColor = (onClick?: () => void) => (onClick ? (trackEvent(store), open()) : accent);\n\nexport const button = css`\n  color: ${getColor()};\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAOsB"
// }

import { css } from "@style-this/core";
import store, { color as accent, track as trackEvent } from "./lib";
import { open } from "./browser";

// references the ignored imports without calling them during evaluation
const getColor = (onClick?: () => void) => (onClick ? (trackEvent(store), open()) : accent);

export const button = css`
  color: ${getColor()};
`;
