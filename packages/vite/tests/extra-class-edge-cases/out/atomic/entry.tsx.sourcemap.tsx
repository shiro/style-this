// {
//   "version": 3,
//   "file": "/home/shiro/project/style-this/packages/vite/tests/extra-class-edge-cases/entry.tsx.css",
//   "sources": [
//     "/home/shiro/project/style-this/packages/vite/tests/extra-class-edge-cases/entry.tsx"
//   ],
//   "sourcesContent": [
//     "import { css, extraClass } from \"@style-this/core\";\nimport { styled } from \"@style-this/react\";\n\n// extraClass at the beginning, then CSS after\nconst test1 = css`\n  ${extraClass(\"beginning\")}\n  background: red;\n  color: white;\n`;\n\n// extraClass at the end, after CSS\nconst test2 = css`\n  background: blue;\n  color: black;\n  ${extraClass(\"ending\")}\n`;\n\n// extraClass as the only thing in the CSS block\nconst test3 = css`\n  ${extraClass(\"only-thing\")}\n`;\n\n// Three extraClass calls in the same css block\nconst test4 = css`\n  background: green;\n  ${extraClass(\"first\")}\n  padding: 10px;\n  ${extraClass(\"second third\")}\n  margin: 5px;\n  ${extraClass(\"fourth\")}\n`;\n\n// Child styled component extends parent, both have extraClass\nconst ParentStyled = styled.div`\n  background: yellow;\n  ${extraClass(\"parent-class\")}\n  padding: 20px;\n`;\n\nconst ChildStyled = styled(ParentStyled)`\n  color: purple;\n  ${extraClass(\"child-class\")}\n  border: 1px solid black;\n`;\n\n// Multiple spaces and mixed positioning\nconst test5 = css`\n  ${extraClass(\"class1  class2\")}\n  display: flex;\n  ${extraClass(\"class3\")}\n  ${extraClass(\"class4   class5\")}\n  padding: 1rem;\n`;\n\n// Empty extraClass\nconst test6 = css`\n  background: orange;\n  ${extraClass(\"\")}\n  color: white;\n`;\n\n// Only spaces\nconst test7 = css`\n  background: pink;\n  ${extraClass(\"   \")}\n`;\n"
//   ],
//   "names": [],
//   "mappings": "AAIc;;;AAOA;;;AAOA;;;AAKA;;;AAUO;;;AAMD;;;AAON;;;AASA;;;AAOA"
// }

import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";

// extraClass at the beginning, then CSS after
const test1 = css`
  ${extraClass("beginning")}
  background: red;
  color: white;
`;

// extraClass at the end, after CSS
const test2 = css`
  background: blue;
  color: black;
  ${extraClass("ending")}
`;

// extraClass as the only thing in the CSS block
const test3 = css`
  ${extraClass("only-thing")}
`;

// Three extraClass calls in the same css block
const test4 = css`
  background: green;
  ${extraClass("first")}
  padding: 10px;
  ${extraClass("second third")}
  margin: 5px;
  ${extraClass("fourth")}
`;

// Child styled component extends parent, both have extraClass
const ParentStyled = styled.div`
  background: yellow;
  ${extraClass("parent-class")}
  padding: 20px;
`;

const ChildStyled = styled(ParentStyled)`
  color: purple;
  ${extraClass("child-class")}
  border: 1px solid black;
`;

// Multiple spaces and mixed positioning
const test5 = css`
  ${extraClass("class1  class2")}
  display: flex;
  ${extraClass("class3")}
  ${extraClass("class4   class5")}
  padding: 1rem;
`;

// Empty extraClass
const test6 = css`
  background: orange;
  ${extraClass("")}
  color: white;
`;

// Only spaces
const test7 = css`
  background: pink;
  ${extraClass("   ")}
`;
