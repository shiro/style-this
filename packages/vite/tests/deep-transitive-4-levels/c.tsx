import { css } from "@style-this/core";
import { extendedColor, extendedSize } from "./b";
import { baseColor } from "./a";

// Level 3: Constructs from Level 2 and Level 1
export const finalColor = `linear-gradient(${baseColor}, ${extendedColor})`;
export const finalSize = `max(${extendedSize}, 50px)`;

const cStyle = css`
  background: ${finalColor};
  height: ${finalSize};
`;

export { cStyle };
