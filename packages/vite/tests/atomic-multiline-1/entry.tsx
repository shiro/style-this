import { css } from "@style-this/core";
import "@style-this/core/atomic";

export const grid = css`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto;
  transition:
    color 0.2s,
    background 0.2s;
  &:hover {
    color: blue;
  }
`;
