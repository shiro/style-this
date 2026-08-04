import { css } from "@style-this/core";
import "@style-this/core/atomic";

// Inner component with base styles
const innerStyle = css`
  background: red;
  padding: 10px;
`;

// Outer component - wraps inner and overrides background to coral
// Uses CSS selector to target inner component
const outerStyle = css`
  width: 100%;
  .${innerStyle} {
    background: coral;
  }
  @media (max-width: 500px) {
    .${innerStyle} {
      background: blue;
    }
  }
`;

export { outerStyle, innerStyle };
