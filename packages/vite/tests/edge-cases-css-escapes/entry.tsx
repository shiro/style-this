import { css, style } from "@style-this/core";

const icon = "\\f101";

const shared = style`
  content: "\f102";
`;

export const dash = css`
  &::before {
    content: "\2014 \` \${icon}";
  }
`;

export const iconFont = css`
  ${shared}
  &::after {
    content: "\f101 ${icon}";
  }
`;
