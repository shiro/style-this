import { css } from "@style-this/core";
import { styled } from "@style-this/solid";
import { Component } from "solid-js";

const Counter: Component = (p) => {
  let count = $signal(0);

  return (
    <div class={CounterStyle}>
      {count}

      <FancyButton2
        disabled
        styleProps={{ a: 8, b: 16 }}
        onClick={() => ++count}
      >
        count me
      </FancyButton2>
    </div>
  );
};

const spacing = 16;

export const CounterStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${spacing}px;
  margin: ${spacing}px;
  padding: ${spacing}px;
  border: 1px solid blue;
  border-radius: ${spacing / 2}px;
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

  background: ${({ props }) => (props.disabled ? "red" : "green")};
`;

export default Counter;
