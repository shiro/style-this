'use client';

import { css, extraClass } from '@style-this/core';
import { styled } from '@style-this/react';
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={CounterStyle}>
      {count}

      <FancyButton2
        styleProps={{ a: 8, b: 16 }}
        onClick={() => setCount(count + 1)}
        disabled={count >= 3}
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
  border: 1px solid blue;
  border-radius: ${spacing / 2}px;
  background: white;
  ${extraClass("something")}
`;

export const FancyButton = styled.button<{ a: number }>`
  border: 1px solid blue;
  border-radius: 2px;
  padding: ${({ a }) => `${a}px`};
`;

export const FancyButton2 = styled(FancyButton) <{ b: number }>`
  margin: ${({ b }) => `${b}px`};
  min-height: ${({ b }) => `${b}px`};
  cursor: pointer;

  background: ${({ props }) => (props.disabled ? 'red' : 'green')};
  color: white;
  font-weight: bold;
`;

export default Counter;
