import { css } from "@style-this/core";

const accent = "blue",
  outline = accent;

function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
    border-bottom: ${border};
  `;
}

export class Theme {
  static accent = css`
    color: ${accent};
    outline-color: ${outline};
  `;
}

// declared below their uses
const decoration = "none";
const border = `1px solid ${accent}`;
