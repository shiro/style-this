import { css, style } from "@style-this/core";
import mib, * as a from "./a";

const mutate = (v) => v;

const a1 = () => {
  const a2 = () => {
    const a3 = () => {
      return css`a`;
    };
    return [0];
  };
  const wi = a2();
  const m = css`
    ${wi}
  `;
};

const b = css`
  ${a1}
`;

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

const { color } = { color: "blue" };

const st = style`
  color: ${color};
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
