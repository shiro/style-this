import { css } from "@style-this/core";

export function getLink() {
  return css`
    text-decoration: ${underline(false)};
    border-bottom: ${border};
    ${focus().css}
  `;
}

// declared below their uses
function underline(enabled: boolean) {
  return enabled ? "underline" : decoration;
}

// its CSS moves up with it
function focus() {
  return css`outline: none;`;
}

const accent = "blue",
  outline = accent;

export class Theme {
  static accent = css`
    color: ${accent};
    outline-color: ${outline};
    text-decoration: ${underline(true)};
  `;
}

const decoration = "none";
// `accent` and `borderStyle` move up with it
const border = `1px ${borderStyle} ${accent}`;
const borderStyle = "solid";
// destructured into a temporary when the importer evaluates it, which doesn't change the class
// names above
export const { weight } = { weight: "bold" };
