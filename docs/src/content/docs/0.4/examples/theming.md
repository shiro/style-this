---
title: Theming & design tokens
description: Share tokens between styles and switch themes with custom properties.
sidebar:
  order: 2
slug: 0.4/examples/theming
---

## Build-time tokens

Tokens are regular modules. They're inlined into the CSS at build time and cost nothing at runtime.

```ts title="theme.ts"
export const space = (n: number) => `${n * 4}px`;

export const colors = {
  primary: "#4f46e5",
  surface: "#ffffff",
  text: "#111827",
};

export const breakpoints = {
  mobile: "@media (max-width: 600px)",
};
```

```ts title="Card.tsx"
import { css } from "@style-this/core";
import { breakpoints, colors, space } from "./theme";

export const card = css`
  padding: ${space(4)};
  background: ${colors.surface};
  color: ${colors.text};

  ${breakpoints.mobile} {
    padding: ${space(2)};
  }
`;
```

Editing `theme.ts` hot-updates every style using the changed export.

## Runtime theme switching

Values that change at runtime can't be inlined, back them with custom properties defined in a
[global style](/0.4/guides/css/#global-styles).

```ts title="theme.ts"
import { css } from "@style-this/core";

export const vars = {
  bg: "var(--bg)",
  fg: "var(--fg)",
};

const _GlobalTheme = css`
  :root {
    --bg: white;
    --fg: black;
  }

  :root[data-theme="dark"] {
    --bg: #111;
    --fg: #eee;
  }
`;
```

```ts title="Page.tsx"
import { css } from "@style-this/core";
import { vars } from "./theme";

const page = css`
  background: ${vars.bg};
  color: ${vars.fg};
`;
```

```ts
document.documentElement.dataset.theme = "dark";
```

Make sure the module defining the global style is imported somewhere in your app, its CSS is loaded
with it.

## Mixins

```ts title="mixins.ts"
import { style } from "@style-this/core";

export const focusRing = style`
  outline: 2px solid royalblue;
  outline-offset: 2px;
`;

export const hover = (body: string) => style`
  @media (hover: hover) {
    &:hover { ${body} }
  }
`;
```

```ts
const button = css`
  &:focus-visible { ${focusRing} }
  ${hover("background: whitesmoke;")}
`;
```
