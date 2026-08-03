import Counter from "./Counter";
import { css } from "@style-this/core";

const color: string = "coral";

const colorStyle = css`
  color: ${color};
`;

const Main: Component = () => {
  return (
    <div class={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span class={colorStyle}>
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
`

export default Main;
