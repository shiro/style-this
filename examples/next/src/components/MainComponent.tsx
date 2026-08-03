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
    <div className={ContainerStyle}>
      <Counter />
      hello
      <span className={colorStyle}>world</span>
    </div>
  );
};

export default MainComponent;
