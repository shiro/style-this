import { css } from "@style-this/core";

const decoration = "none";
const accent = "blue";

function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
  `;
}

export class Theme {
  static accent = css`
    color: ${accent};
  `;
}
