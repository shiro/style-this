import { css } from "@style-this/core";
import Palette, { Badge, getLink, Sizes, Theme, weight, Weight } from "./b";
import * as b from "./b";
import rounded from "./c";

// a member of a namespace import
import InnerSizes = b.InnerSizes;

const color = "red";

const nav = css`
  .${getLink()}, .${Theme.accent} {
    font-weight: ${weight};
  }
`;

const page = css`
  .${Page()} > .${Palette.accent}, .${rounded()}, .${Sizes.card} {
    gap: ${Sizes.gap};
    font-weight: ${Weight.Bold};
    color: ${Badge.color};
    padding: ${InnerSizes.gap};
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
