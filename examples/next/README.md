# next

Next.js 16 example using both the app router and the pages router with `@style-this/next` and `@style-this/react`.

Build the packages from the repository root first (`pnpm install && pnpm build`), then:

```bash
pnpm dev                   # dev server (turbopack)
pnpm dev:atomic            # dev server (turbopack), atomic mode
pnpm dev:webpack           # dev server (webpack)
pnpm dev:webpack:atomic    # dev server (webpack), atomic mode
pnpm build                 # production build (turbopack)
pnpm build:atomic          # production build (turbopack), atomic mode
pnpm build:webpack         # production build (webpack)
pnpm build:webpack:atomic  # production build (webpack), atomic mode
pnpm start                 # serve the production build
```

Open http://localhost:3000.

- `/` and `/about` (app router, `src/app`)
- `/pages-router` (pages router, `src/pages`)

Files:

- `src/components/Counter.tsx`: `css`, `extraClass`, `styled`, `styleProps`, extending styled components (client component)
- `src/components/Main.tsx`: `mergeStyles`, global styles, values imported across files (`a.ts` → `b.tsx`)
- `src/components/AppShell.tsx`: the `#app` wrapper shared by both routers
- `src/app/layout.tsx`, `src/pages/_app.tsx`: the `app.css` and `@style-this/core/atomic` imports

See the [docs](https://style-this.usagi.io) for an explanation of the APIs used here.
