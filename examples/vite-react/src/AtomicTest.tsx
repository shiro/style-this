import { css } from "@style-this/core";

const TestStyle = css`
  color: red;
  padding: 10px;
`;

export const AtomicTest = () => {
  return <div className={TestStyle}>Atomic Test</div>;
};
