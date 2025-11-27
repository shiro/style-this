import { css, style } from "@style-this/core";

const mutate = (v) => v;

const a = () => {
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
`;

const s2 = css`
  ${st}
  ${a().css}
`;

const unrelated = css`
  background: none;
`;
