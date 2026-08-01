import { css, extraClass } from "@style-this/core";

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
