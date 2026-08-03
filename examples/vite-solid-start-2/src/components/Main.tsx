import { css } from "@style-this/core";
import Counter from "./Counter";

const ContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

export default function Main() {
  return (
    <div class={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span
        class={css`
          color: coral;
        `}
      >
        world
      </span>
    </div>
  );
}

const _GlobalMain = css`
  .Global__Main {
    background: coral;
  }
`
