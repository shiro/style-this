# style-this

Zero-runtime CSS-in-JS for the modern web. Write styles next to your components, ship plain CSS.
The transform is written in Rust and shipped as WebAssembly.

```tsx
import { css } from "@style-this/core";

const spacing = 16;

const card = css`
  padding: ${spacing}px;
  border-radius: ${spacing / 2}px;
`;

export const Card = () => <div className={card}>Hello</div>;
```

- Styles are evaluated at build time, `css` compiles to a class name
- Styled components for React and SolidJS, plain `css` everywhere else (Svelte, vanilla, ...)
- Optional atomic output, kept in a `utilities` cascade layer
- Cross-file HMR and CSS source maps
- Works with Vite, SolidStart, SvelteKit and Next.js

**Documentation: [style-this.usagi.io](https://style-this.usagi.io)**

## Packages

| Package | Purpose |
| --- | --- |
| [`@style-this/core`](packages/core) | `css`, `mergeStyles`, `extraClass` and the compiler |
| [`@style-this/vite`](packages/vite) | Vite plugin |
| [`@style-this/next`](packages/next) | Next.js integration |
| [`@style-this/react`](packages/react) | `styled` components for React |
| [`@style-this/solid`](packages/solid) | `styled` components for SolidJS |
| [`@style-this/webpack`](packages/webpack) | webpack plugin |

All packages are released in lockstep, use the same version for each of them.

## Examples

Runnable projects live in [`examples/`](examples). From the repository root:

```bash
pnpm install && pnpm build
cd examples/vite-react
pnpm dev         # default mode
pnpm dev:atomic  # atomic mode
```

## License

MIT
