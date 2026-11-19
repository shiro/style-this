// {
//   "version": 3,
//   "file": "/packages/vite/tests/expressions-3/entry.tsx.css",
//   "sources": [
//     "/packages/vite/tests/expressions-3/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css } from \"@style-this/core\";\n\nexport function Button() {\n  const color = \"red\";\n  const size = 4;\n  const theme = { color: \"blue\", size: 8 };\n  const shorthand = { color, size };\n  const methods = {\n    color() {\n      return \"green\";\n    },\n  };\n  const pick = ({ color }: { color: string }) => color;\n  const { size: padding } = theme;\n\n  const button = css`\n    color: ${theme.color};\n    border-color: ${shorthand.color};\n    outline-color: ${methods.color()};\n    background: ${pick({ color: \"yellow\" })};\n    margin: ${theme[\"size\"]}px ${shorthand.size}px;\n    padding: ${padding}px;\n  `;\n  return button;\n}\n"
//   ],
//   "names": [],
//   "mappings": "AAeiB"
// }

import { css } from "@style-this/core";

export function Button() {
  const color = "red";
  const size = 4;
  const theme = { color: "blue", size: 8 };
  const shorthand = { color, size };
  const methods = {
    color() {
      return "green";
    },
  };
  const pick = ({ color }: { color: string }) => color;
  const { size: padding } = theme;

  const button = css`
    color: ${theme.color};
    border-color: ${shorthand.color};
    outline-color: ${methods.color()};
    background: ${pick({ color: "yellow" })};
    margin: ${theme["size"]}px ${shorthand.size}px;
    padding: ${padding}px;
  `;
  return button;
}
