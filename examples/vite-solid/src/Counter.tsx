import { css } from "@style-this/core";
import { styled } from "@style-this/solid";

const Counter: Component = () => {
  let count = $signal(0);

  return (
    <div class={CounterStyle}>
      {count}

      <FancyButton onClick={() => ++count}>count me</FancyButton>
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

const FancyButton = styled.button`
  background: none;
  border: 1px solid blue;
  border-radius: 2px;
  padding: 8px;
`;

export default Counter;
