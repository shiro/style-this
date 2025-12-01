import { css } from "@style-this/core";

export const foo = css`
  color: white;
`;

export default function () {
  return css`
    color: hotpink;
  `;
}

export function f2() {
  return css`
    color: hotpink;
  `;
}
