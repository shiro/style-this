import { describe, it, expect } from 'vitest';
import { css } from '../src/index';

describe('@style-this/core', () => {
  it('should export css function', () => {
    expect(typeof css).toBe('function');
  });

  it('should throw error when css is called at runtime', () => {
    expect(() => css`color: red;`).toThrow(
      "@style-this: called 'css' at runtime. This indicates an error in the transform."
    );
  });
});

