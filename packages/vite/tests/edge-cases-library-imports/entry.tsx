import { css } from "@style-this/core";
// outside of the project's `node_modules`, like the workspace root's in monorepos
import { getNumber } from "some_lib";

const a = css`
  margin: ${getNumber()};
`;
