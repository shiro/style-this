import { styled } from "@style-this/react";
import { css } from "@style-this/core";

// must not be shadowed by the generated wrapper's props
const props = { gap: 4 };

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => a}px;
  gap: ${() => props.gap}px;
`;

const unrelated = css`
  background: none;
`;
