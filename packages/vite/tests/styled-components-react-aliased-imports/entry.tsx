import { styled as s } from "@style-this/react";
import * as sr from "@style-this/react";

export const NsLink = sr.styled.a`
  color: blue;
`;

// shadowed by the parameter, not ours
export const shadowed = (s: any) => s.div`color: green;`;

// not ours, must stay untouched
const css = (strings: TemplateStringsArray) => strings.join("");

export const foreign = css`color: red;`;

export const FancyButton = s.button`
  background: none;
`;
