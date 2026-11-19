import { css } from "@style-this/core";

export function getLink() {
  return css`
    text-decoration: none;
  `;
}

export class Theme {
  static accent = css`
    color: blue;
  `;
}
