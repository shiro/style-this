# @style-this/core

Core package of [style-this](https://style-this.usagi.io), zero-runtime CSS-in-JS. Provides `css`, `style`,
`extraClass`, `mergeStyles`, `joinStyles` and the WebAssembly compiler used by the bundler plugins.

```bash
pnpm add @style-this/core
```

```tsx
import { css, mergeStyles } from "@style-this/core";

const button = css`
  padding: 8px 16px;
`;

const primary = css`
  background: royalblue;
`;

<button className={mergeStyles(button, primary)} />;
```

Styles are compiled at build time, so a bundler integration is required:
[`@style-this/vite`](https://www.npmjs.com/package/@style-this/vite) or
[`@style-this/next`](https://www.npmjs.com/package/@style-this/next).

Documentation: [style-this.usagi.io/reference/core/](https://style-this.usagi.io/reference/core/)
