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

// compiled to JS with the rest
export namespace Sizes {
  export const gap = "2px";
  // members keep their name, even if the outer one is renamed
  export namespace Inner {
    export const gap = "3px";
  }
  export const card = css`
    gap: ${gap};
    padding: ${Inner.gap};
  `;
}

export enum Weight {
  Bold = "bold",
}

// merged, each declaration reads it from the value cache
export function Badge() {
  return "badge";
}
export namespace Badge {
  export const color = "olive";
}

const grid = css`
  gap: ${Sizes.gap};
  font-weight: ${Weight.Bold};
  color: ${Badge.color};
`;

// references itself under its local name
export default class Palette {
  static primary = "teal";
  static accent = css`
    color: ${Palette.primary};
  `;
}
