import { css, style } from "@style-this/core";
import mib, * as a from "./a";

const mutate = (v) => v;

const comp = () => {
  ("foob");

  const b = () => {
    const c = () => css`
      background: blue;
    `;

    const s1 = css`
      ${c().css}
    `;
  };

  mutate(b);

  return css``;
};

const st = style`
  color: pink;
  ${mib.foo().css}
`;

const s2 = css`
  ${st}
  ${comp().css}
`;

const unrelated = css`
  background: none;
  ${a.foo.css}
`;
