import { css } from "@style-this/core";
import "@style-this/core/atomic";
import { sharedStyle } from "./shared";

const entryStyle = css`
  color: green;
  font-size: 16px;
`;

const combined = css`
  ${sharedStyle}
  border: 1px solid black;
`;
