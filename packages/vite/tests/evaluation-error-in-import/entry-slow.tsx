import { css } from "@style-this/core";
import { size } from "./slow-dep";
import { color } from "./dep";

export const button = css`
  color: ${color};
  font-size: ${size};
`;
