# vite-react

Vite + React example using `@style-this/vite` and `@style-this/react`.

Build the packages from the repository root first (`pnpm install && pnpm build`), then:

```bash
pnpm dev                   # dev server
pnpm dev:atomic            # dev server, atomic mode
pnpm build                 # production build
pnpm build:atomic          # production build, atomic mode
```

Open http://localhost:3000.

- `src/Counter.tsx`: `css`, `extraClass`, `styled`, `styleProps`, extending styled components
- `src/MainComponent.tsx`: `mergeStyles`, global styles, values imported across files (`a.ts` → `b.tsx`)
- `src/App.tsx`: the `@style-this/core/atomic` entrypoint

See the [docs](https://style-this.usagi.io) for an explanation of the APIs used here.
