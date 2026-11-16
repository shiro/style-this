---
title: Svelte & SvelteKit
description: Use style-this in Svelte components.
sidebar:
  order: 3
slug: 0.3/frameworks/svelte
---

```bash
pnpm add @style-this/core
pnpm add -D @style-this/vite
```

```ts title="vite.config.ts"
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import styleThis from "@style-this/vite";

export default defineConfig({
  plugins: [
    styleThis({ filter: /\.svelte$/ }),
    sveltekit(),
  ],
});
```

Add your `.ts` files to `filter` as well if you define styles outside of components.

## Usage

Styles are written in the component's `<script>` block.

```svelte title="src/lib/Counter.svelte"
<script lang="ts">
  import { css, extraClass } from "@style-this/core";

  const spacing = 16;

  const wrapper = css`
    display: flex;
    gap: 8px;
    padding: ${spacing}px;
    ${extraClass("counter")}
  `;

  const button = css`
    border: 1px solid blue;
    background: var(--bg);
  `;

  let count = $state(0);
</script>

<div class={wrapper}>
  {count}
  <button
    class={button}
    style="--bg: {count >= 3 ? 'red' : 'green'}"
    onclick={() => count++}
  >
    count me
  </button>
</div>
```

## Limitations

* Only the first `<script>` block of a component is transformed.
* There's no `styled` for Svelte. Use `css` with custom properties for dynamic values, and
  [`mergeStyles`](/0.3/guides/merging-styles/) to combine classes.

Example:
[`sveltekit-3`](https://github.com/shiro/style-this/tree/master/examples/sveltekit-3).
