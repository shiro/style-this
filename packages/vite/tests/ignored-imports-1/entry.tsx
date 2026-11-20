import { css } from "@style-this/core";
import store, { color as accent, track as trackEvent } from "./lib";
import { open } from "./browser";

// references the ignored imports without calling them during evaluation
const getColor = (onClick?: () => void) => (onClick ? (trackEvent(store), open()) : accent);

export const button = css`
  color: ${getColor()};
`;
