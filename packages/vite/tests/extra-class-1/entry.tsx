import { css, extraClass } from "@style-this/core";

const a = css`
  background: red;
  ${extraClass("foo bar")}
`;

const b = css`
  color: blue;
  ${extraClass("baz")}
`;
