import { css } from "@style-this/core";

const getColor = (): string => {
  throw new Error("failed to compute color");
};

export const color = getColor();

export const text = css`
  color: ${color};
`;
