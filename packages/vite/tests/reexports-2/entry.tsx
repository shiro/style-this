const scale = 2;

// imports after other statements
import { css } from "@style-this/core";
import "@style-this/core/atomic";
import { primary, secondary, own, palette, tokens } from "./b";

export const box = css`
  color: ${primary};
  background: ${secondary};
  border-color: ${own};
  outline-color: ${palette.accent};
  caret-color: ${palette.secondary};
  text-decoration-color: ${tokens.base};
  width: ${scale * 10}px;
`;
