import { css } from "@style-this/core";
import { color as originalColor } from "./c";

export const color = "hot" + originalColor;

const exported = css`
  background: ${color};
`;
