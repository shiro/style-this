import { css } from "@style-this/core";

export const $btn = css`
  color: red;
`;

export const $Global = css`
  color: green;
`;

export const wrapper = css`
  .${$btn} {
    color: blue;
  }
`;
