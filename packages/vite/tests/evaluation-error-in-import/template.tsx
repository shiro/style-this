import { css } from "@style-this/core";
import { button } from "./working";

// the error is located in the template, not shifted by the import or the emoji before it
export const link = css`
  .${button} { content: "🎨"; color: ${(() => { throw new Error("no color"); })()}; }
`;
