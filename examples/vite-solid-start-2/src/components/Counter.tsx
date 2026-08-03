import { css } from "@style-this/core";
import { styled } from "@style-this/solid";
import { createSignal } from "solid-js";

const spacing = 16;

export const CounterStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${spacing}px;
  margin: ${spacing}px;
  border: 1px solid blue;
  border-radius: ${spacing / 2}px;
  background: white;
`;

export const FancyButton = styled.button<{ a: number }>`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => `${a}px`};
`;

export const FancyButton2 = styled(FancyButton)<{ b: number }>`
  margin: ${({ b }) => `${b}px`};
  min-height: ${({ b }) => `${b}px`};
  cursor: pointer;
  background: ${({ props }) => (props.disabled ? "red" : "green")};
`;

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <div class={CounterStyle}>
      <span>Count: {count()}</span>
      <FancyButton2
        styleProps={{ a: 8, b: 16 }}
        onClick={() => setCount(count() + 1)}
        disabled={count() >= 3}
      >
        Increment
      </FancyButton2>
    </div>
  );
}
