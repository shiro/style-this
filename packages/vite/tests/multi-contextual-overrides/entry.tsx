import { css } from "@style-this/core";
import { inner } from "./b";

const outer = css`
  .${inner} {
    background: "red";
  }
`;
