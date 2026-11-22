import { css } from "@style-this/core";
import getGap, { late, color, renamed, secondary, fromC, border, Props } from "./b";

const pad = (props: Props) => props.gap;

export const box = css`
  color: ${color};
  background: ${renamed};
  outline-color: ${secondary};
  border: ${border};
  border-color: ${fromC};
  gap: ${getGap()};
  padding: ${pad({ gap: 2 })}px;

  .${late} {
    margin: 0;
  }
`;
