# @style-this/react

`styled` components for React, part of [style-this](https://style-this.usagi.io), zero-runtime CSS-in-JS.

```bash
pnpm add @style-this/core @style-this/react
```

```tsx
import { styled } from "@style-this/react";

const Button = styled.button<{ size: number }>`
  padding: ${({ size }) => `${size}px`};
  background: ${({ props }) => (props.disabled ? "gray" : "green")};
`;

<Button styleProps={{ size: 8 }}>Save</Button>;
```

Requires a bundler integration such as [`@style-this/vite`](https://www.npmjs.com/package/@style-this/vite).

Documentation: [style-this.usagi.io/guides/styled-components/](https://style-this.usagi.io/guides/styled-components/)
