# vite-solid-start-2

SolidStart 2 example using `@style-this/vite` and `@style-this/solid`.

Build the packages from the repository root first (`pnpm install && pnpm build`), then:

```bash
pnpm dev                   # dev server
pnpm dev:atomic            # dev server, atomic mode
pnpm build                 # production build
pnpm build:atomic          # production build, atomic mode
pnpm start                 # run the production build
```

Open http://localhost:3000. Styles are defined in `src/components/`, the
`@style-this/core/atomic` entrypoint is imported in `src/app.tsx`.
`src/app.css` declares the cascade layer order and puts the base styles into `@layer base`, so
atomic classes can override them.

See the [docs](https://style-this.usagi.io) for an explanation of the APIs used here.
