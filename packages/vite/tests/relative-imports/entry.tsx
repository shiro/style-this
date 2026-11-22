import { css } from "@style-this/core";
import { color } from "./theme";
import { buttonColor } from "./nested/button";

export const entryStyle = css`
  color: ${color};
  border-color: ${buttonColor};
`;
