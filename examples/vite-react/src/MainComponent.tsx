import Counter from "./Counter";
import { css } from "@style-this/core";

const color: string = "coral";

const Main = () => {
  return (
    <div className={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span
        className={css`
          color: ${color};
        `}
      >
        world
      </span>
    </div>
  );
};

const ContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const _GlobalMain = css`
  .Global__Main {
    background: coral;
  }
`;

export default Main;
