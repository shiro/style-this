import { css, mergeStyles } from "@style-this/core";
import Counter, { counterColor } from "./Counter";

const ContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const colorStyle = css`
  color: coral;
  background: ${counterColor};
`;

const highlightStyle = css`
  color: crimson;
`;

export default function Main() {
  return (
    <div className={`${ContainerStyle} Global__Main`}>
      <Counter />
      hello
      <span className={mergeStyles(colorStyle, highlightStyle)}>
        world
      </span>
    </div>
  );
}

const _GlobalMain = css`
  .Global__Main {
    background: ${counterColor};
  }
`;
