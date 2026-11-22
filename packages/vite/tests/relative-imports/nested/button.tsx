import { css } from "@style-this/core";
import { color } from "./theme";
import { color as rootColor } from "../theme";

export const buttonColor = color;

export const buttonStyle = css`
  color: ${color};
  background: ${rootColor};
`;
