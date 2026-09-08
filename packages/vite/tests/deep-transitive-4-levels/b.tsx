import { css } from "@style-this/core";
import { baseColor, baseSize } from "./a";

// Level 2: Constructs from Level 1
export const extendedColor = `${baseColor}-extended`;
export const extendedSize = `calc(${baseSize} * 2)`;

const bStyle = css`
  background: ${extendedColor};
  width: ${extendedSize};
`;

export { bStyle };
