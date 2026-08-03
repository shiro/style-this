import Counter from "./Counter";
import { css } from "@style-this/core";

const color: string = "coral";

const Main: Component = () => {
  // const color = "blue";
  return (
    <div class={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span
        class={css`
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
`

export default Main;
