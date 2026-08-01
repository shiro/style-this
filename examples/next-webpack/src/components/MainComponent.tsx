'use client';

import Counter from './Counter';

const MainComponent = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Counter />
      <div>
        hello <span style={{ color: 'coral' }}>world</span>
      </div>
    </div>
  );
};

export default MainComponent;
