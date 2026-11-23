import { css } from "@style-this/core";

export const num = Math.random();

// the entries use different names, `top` is cached when evaluating `bottom`
export const { top, bottom } = { top: 1, bottom: 2 };

const shared = css`
  margin: ${num}px;
`;
