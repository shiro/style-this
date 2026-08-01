import { css, extraClass } from "@style-this/core";
import { styled } from "@style-this/react";

// extraClass at the beginning, then CSS after
const test1 = css`
  ${extraClass("beginning")}
  background: red;
  color: white;
`;

// extraClass at the end, after CSS
const test2 = css`
  background: blue;
  color: black;
  ${extraClass("ending")}
`;

// extraClass as the only thing in the CSS block
const test3 = css`
  ${extraClass("only-thing")}
`;

// Three extraClass calls in the same css block
const test4 = css`
  background: green;
  ${extraClass("first")}
  padding: 10px;
  ${extraClass("second third")}
  margin: 5px;
  ${extraClass("fourth")}
`;

// Child styled component extends parent, both have extraClass
const ParentStyled = styled.div`
  background: yellow;
  ${extraClass("parent-class")}
  padding: 20px;
`;

const ChildStyled = styled(ParentStyled)`
  color: purple;
  ${extraClass("child-class")}
  border: 1px solid black;
`;

// Multiple spaces and mixed positioning
const test5 = css`
  ${extraClass("class1  class2")}
  display: flex;
  ${extraClass("class3")}
  ${extraClass("class4   class5")}
  padding: 1rem;
`;

// Empty extraClass
const test6 = css`
  background: orange;
  ${extraClass("")}
  color: white;
`;

// Only spaces
const test7 = css`
  background: pink;
  ${extraClass("   ")}
`;
