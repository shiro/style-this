import { css } from "@style-this/core";

export const foo = css`
  color: white;
`;

export function f2() {
  return css`
    color: hotpink;
  `;
}

export default class M {
  static foo() {
    return css`
      color: green;
    `;
  }
}
