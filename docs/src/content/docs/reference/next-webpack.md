---
title: "@style-this/webpack & @style-this/next"
description: webpack plugin and Next.js integration reference.
sidebar:
  order: 4
  label: "@style-this/webpack · next"
---

## `@style-this/webpack`

```ts
import { StyleThisPlugin } from "@style-this/webpack";

new StyleThisPlugin(options?: StyleThisPluginOptions)
```

Setup guide: [webpack](/frameworks/webpack/). The plugin:

- adds the transform loader for `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` outside `node_modules`, which
  runs before the loaders of your own rules
- adds the loaders serving the generated CSS and atomic class modules. The CSS is imported as
  `.css` files and goes through your CSS rule.
- aliases `@style-this/core/atomic`

| Option | Default | Description |
| --- | --- | --- |
| `atomic` | `false` | enables [atomic mode](/guides/atomic-css/) |
| `useRequire` | `false` | same as the [Vite option](/reference/vite/#userequire) |

Generated module ids don't depend on the project's location, so they're stable for long-term
caching.

Peer dependency: `webpack ^5`.

### `@style-this/webpack/core`

The loaders and helpers the plugin is built from, for integrations such as `@style-this/next`. Not
needed for regular use.

## `@style-this/next`

```ts
import { withStyleThis } from "@style-this/next";

withStyleThis(config: NextConfig): NextConfig
```

Setup guide: [Next.js](/frameworks/next/). Wraps a Next.js config with the loaders of
`@style-this/webpack`:

- **webpack**: adds the same rules as `StyleThisPlugin`, and keeps Next's CSS modules from renaming
  style-this classes. A user supplied `webpack` function is called afterwards.
- **Turbopack**: adds `turbopack.rules` for `*.{tsx,ts,jsx,js,mjs}` (excluding `node_modules`)
  and for the generated stylesheets and atomic class modules, and a `resolveAlias` for
  `@style-this/core/atomic`. A user rule for the same glob is kept and runs first.

The passed config isn't mutated.

| Environment variable | Effect |
| --- | --- |
| `ATOMIC=1` | enables [atomic mode](/guides/atomic-css/) |

Peer dependencies: `next >=16.2`, `webpack ^5`.
