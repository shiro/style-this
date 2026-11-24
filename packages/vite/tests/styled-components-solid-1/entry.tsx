import { styled } from "@style-this/solid";
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

// must not be shadowed by the generated wrapper's class variable
const ui = {
  accent: "red",
  Card: styled.div`
    color: ${() => ui.accent};
  `,
};

export default styled.div`
  color: ${() => ui.accent};
`;

const unrelated = css`
  background: none;
`;

export const Link = styled("a")<{ size: number }>`
  font-size: ${({ size }) => size}px;
`;

export const Panel = styled(ui.Card)`
  border-color: ${() => ui.accent};
`;

// lowercase and computed bases are components, not HTML elements
const card = (p: { class?: string }) => <div class={p.class} />;
const components = { Card: card };

export const LowercaseBase = styled(card)`
  color: red;
`;

export const ComputedBase = styled(components["Card"])`
  color: ${() => ui.accent};
`;

export const TemplateTag = styled(`span`)`
  color: blue;
`;

// wrapped and non-arrow functions are runtime style functions too
export const StyleFunctions = styled.div<{ size: number }>`
  width: ${function ({ size }) {
    return size;
  }}px;
  height: ${(({ size }) => size) as (p: { size: number }) => number}px;
  margin: ${(({ size }) => size) satisfies (p: { size: number }) => number}px;
  padding: ${(({ size }) => size)!}px;
`;
