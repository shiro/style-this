import { css } from "@style-this/core";

const outer = () => {
  const inner = () => {
    return css`
      background: blue;
    `;
  };
  return css`
    ${inner().css}
    color: red;
  `;
};
