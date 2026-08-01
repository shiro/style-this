'use client';

import { css } from '@style-this/core';
import Counter from './Counter';

const testStyle = css`
  color: coral;
  font-weight: bold;
`;

const MainComponent = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Counter />
      <div>
        hello <span className={testStyle}>world</span>
      </div>
    </div>
  );
};

export default MainComponent;
