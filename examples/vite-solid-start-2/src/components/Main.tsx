import { css } from "@style-this/core";
import Counter from "./Counter";

const ContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const colorStyle = css`
  color: coral;
`;

export default function Main() {
  return (
    <div class={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span class={colorStyle}>
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
