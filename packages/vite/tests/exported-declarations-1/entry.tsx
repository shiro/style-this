import { css } from "@style-this/core";
import { getLink, Theme, weight } from "./b";

const color = "red";

const nav = css`
  .${getLink()}, .${Theme.accent} {
    font-weight: ${weight};
  }
`;

export function Button() {
  const button = css`
    color: ${color};
  `;
  return button;
}

export class Card {
  card = css`
    padding: 4px;
  `;

  render() {
    return css`
      margin: 8px;
    `;
  }
}

export default function Page() {
  return css`
    display: flex;
  `;
}
