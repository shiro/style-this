import { styled } from "@style-this/solid";
import { css } from "@style-this/core";

export const Base = styled.button`
  background: none;
  padding: 8px;
`;

// overrides Base's padding, Base merges this component's classes last
export const Extended = styled(Base)`
  padding: 16px;
  color: red;
`;

export const override = css`
  background: blue;
`;

export const App = () => <Extended class={override}>hi</Extended>;
