import { css } from "@style-this/core";
import * as theme from "./theme";

const pick = (values: typeof theme) => values.color;

export const style = css`
  color: ${pick(theme)};
`;
