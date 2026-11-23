import { styled as s } from "@style-this/react";

// not ours, must stay untouched
const css = (strings: TemplateStringsArray) => strings.join("");

export const foreign = css`color: red;`;

export const FancyButton = s.button`
  background: none;
`;
