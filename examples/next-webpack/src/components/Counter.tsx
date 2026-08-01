'use client';

import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', margin: '16px', border: '1px solid blue', borderRadius: '8px', background: 'white' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{count}</div>

      <button
        disabled={count >= 5}
        onClick={() => setCount(count + 1)}
        style={{
          padding: '8px 16px',
          minHeight: '16px',
          margin: '16px',
          cursor: count >= 5 ? 'not-allowed' : 'pointer',
          background: count >= 5 ? 'red' : 'green',
          color: 'white',
          border: '1px solid blue',
          borderRadius: '2px',
          fontWeight: 'bold',
        }}
      >
        count me
      </button>
    </div>
  );
};

export default Counter;
