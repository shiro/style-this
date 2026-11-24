import { css as cx } from "@style-this/core";
import { styled as s } from "@style-this/solid";
import * as st from "@style-this/core";
import * as sd from "@style-this/solid";

export const NsBase = st.css`
  color: red;
  ${st.extraClass("extra")}
`;

export const NsButton = sd.styled.span`
  margin: 0;
`;

// shadowed by the parameter, not ours
export const shadowed = (cx: any) => cx`color: green;`;

export const Base = cx`
  color: blue;
`;

export const FancyButton = s.button`
  background: none;
`;
