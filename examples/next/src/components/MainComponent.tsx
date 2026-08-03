import { css } from '@style-this/core';
import Counter from './Counter';

const ContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const colorStyle = css`
  color: coral;
`;

const MainComponent = () => {
  return (
    <div className={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span className={colorStyle}>world</span>
    </div>
  );
};

// export to avoid tree-shake
export const _GlobalMain = css`
  .Global__Main {
    background: coral;
  }
`;

export default MainComponent;
