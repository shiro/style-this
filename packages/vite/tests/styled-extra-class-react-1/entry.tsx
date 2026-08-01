import { styled } from "@style-this/react";
import { css, extraClass } from "@style-this/core";

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
  ${extraClass("custom-button primary")}
`;

const unrelated = css`
  background: none;
  ${extraClass("test-class")}
`;
