import { css } from "@style-this/core";
import { secondary } from "./c";

// exported before being declared
export { late, color, internal as renamed, getGap as default, secondary };
export { primary as fromC, default as border, unused } from "./c";

interface Props {
  gap: number;
}
export { Props };

const color = "red";
const internal = "blue";
const size = 4;

function getGap() {
  return `${size}px`;
}

const late = css`
  color: ${color};
`;
