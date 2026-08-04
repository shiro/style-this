import { css } from "@style-this/core";
import "@style-this/core/atomic";

// Regular style
const mainStyle = css`
  background: red;
  padding: 20px;
`;

// Global style with _Global prefix
const _GlobalMain = css`
  .Global__Main {
    background: coral;
    margin: 10px;
  }
  
  @media (max-width: 600px) {
    .Global__Main {
      background: blue;
    }
  }
`;

export { mainStyle, _GlobalMain };
