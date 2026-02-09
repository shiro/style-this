import { styled } from "@style-this/solid";
import { css } from "@style-this/core";

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
`;

const unrelated = css`
  background: none;
`;
