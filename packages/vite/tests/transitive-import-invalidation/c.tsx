import { css } from "@style-this/core";
import { bStyle } from "./b";
import { color } from "./a";

// C uses both B's style and A's color
const cStyle = css`
  color: ${color};
`;

export { cStyle, bStyle };
