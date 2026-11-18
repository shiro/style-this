---
title: Variants & overrides
description: Patterns for component variants, conditional styles and contextual overrides.
sidebar:
  order: 3
slug: 0.4/examples/variants
---

## Variants with `mergeStyles`

Static variants are separate styles picked at render time. Nothing dynamic ends up in the CSS.

```tsx title="Button.tsx"
import { css, mergeStyles } from "@style-this/core";

const base = css`
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
`;

const primary = css`
  background: royalblue;
  color: white;
`;

const ghost = css`
  background: transparent;
  color: royalblue;
`;

const variants = { primary, ghost };

const large = css`
  padding: 12px 24px;
`;

type Props = {
  variant?: keyof typeof variants;
  large?: boolean;
  className?: string;
};

export const Button = ({ variant = "primary", ...props }: Props) => (
  <button
    className={mergeStyles(
      base,
      variants[variant],
      props.large && large,
      props.className,
    )}
  />
);
```

## Continuous values with `styleProps`

Use dynamic expressions when the value isn't one of a fixed set.

```tsx
import { styled } from "@style-this/react";

const Progress = styled.div<{ value: number; color?: string }>`
  height: 4px;
  width: ${({ value }) => `${value * 100}%`};
  background: ${({ color }) => color ?? "royalblue"};
`;

<Progress styleProps={{ value: 0.4 }} />;
```

## Contextual overrides

Reference a child style or component from the parent.

```tsx
import { css } from "@style-this/core";
import { Button } from "./Button";

const toolbar = css`
  display: flex;

  .${Button} {
    border-radius: 0;
  }

  .${Button}:first-child {
    border-radius: 4px 0 0 4px;
  }
`;
```

This works in atomic mode as well: nested rules stay regular CSS scoped under `toolbar`, and since
they're more specific than a single atomic class they reliably win.

## Extending third party components

Any component accepting `className` (React) or `class` (Solid) can be styled.

```tsx
import { Link } from "react-router-dom";
import { styled } from "@style-this/react";

const NavLink = styled(Link)`
  text-decoration: none;

  &[aria-current="page"] {
    font-weight: bold;
  }
`;
```
