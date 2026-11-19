import { css } from "@style-this/core";

export function Button() {
  const color = "red";
  const size = 4;
  const theme = { color: "blue", size: 8 };
  const shorthand = { color, size };
  const methods = {
    color() {
      return "green";
    },
  };
  const pick = ({ color }: { color: string }) => color;
  const { size: padding } = theme;

  const button = css`
    color: ${theme.color};
    border-color: ${shorthand.color};
    outline-color: ${methods.color()};
    background: ${pick({ color: "yellow" })};
    margin: ${theme["size"]}px ${shorthand.size}px;
    padding: ${padding}px;
  `;
  return button;
}
