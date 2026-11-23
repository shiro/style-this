import { css, extraClass } from "@style-this/core";

const a = css`
  background: red;
  ${extraClass("foo bar")}
`;

const b = css`
  color: blue;
  ${extraClass('baz bg-[url("x.png")]')}
`;

const c = css`
  .${a} {
    color: green;
  }
`;
