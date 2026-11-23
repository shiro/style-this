import { css } from "@style-this/core";
// not `import type`, the file has no values to import
import Size, { Theme } from "./types";
import * as types from "./types";

const pick = (theme: Theme) => theme.color;
const scale = (size: Size) => size.value * 2;

export const box = css`
  color: ${pick({ color: "red" })};
  width: ${scale({ value: 4 })}px;
  z-index: ${Object.keys(types).length};
`;
