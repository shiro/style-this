import { css } from "@style-this/core";
import { finalColor, finalSize, cStyle } from "./c";
import { extendedColor } from "./b";
import { baseColor } from "./a";

// Level 4: Constructs from all previous levels
export const ultraColor = `${finalColor} with ${extendedColor} and ${baseColor}`;
export const ultraSize = `clamp(20px, ${finalSize}, 100px)`;

const dStyle = css`
  background: ${ultraColor};
  font-size: ${ultraSize};
  border-color: ${baseColor};
`;

export { dStyle, cStyle };
