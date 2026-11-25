import { css, extraClass, style } from "@style-this/core";

const dark = true;

// nested `css` templates are class names in the outer template
export const direct = css`
  .${css`color: green;`}:hover & {
    color: red;
  }
`;

export const conditional = css`
  .${dark ? css`color: black;` : css`color: white;`} & {
    color: blue;
  }
`;

export const arrow = css`
  .${(() => css`color: pink;`)()} & {
    color: gray;
  }
`;

export const multiLevel = css`
  .${css`.${css`color: orange; ${extraClass("extra")}`} & { color: purple; }`} & {
    color: yellow;
  }
`;

const hover = style`
  .${css`color: teal;`}:hover & {
    color: navy;
  }
`;

export const mixin = css`
  ${hover}
`;

// function locals are renamed in the nested and `style` templates
function local() {
  const color = "olive";
  const tint = style`background: ${color};`;
  return css`
    .${css`color: ${color};`} & {
      ${tint}
    }
  `;
}

export const fromFunction = local();

function withDefault(
  className = css`
    .${css`color: lime;`} & {
      color: maroon;
    }
  `,
) {
  return className;
}

export const fromDefault = withDefault();
