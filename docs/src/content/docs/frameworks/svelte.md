---
title: Svelte & SvelteKit
description: Use style-this in Svelte components.
sidebar:
  order: 3
---

## Setup

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
    styleThis({ filter: [/\.svelte$/, /\.ts$/] }),
    sveltekit(),
  ],
});
```

`/\.ts$/` is only needed if you also define styles outside of components.

## Usage

Styles are written in the component's `<script>` blocks.

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

Both the instance `<script>` and the `<script module>` (or legacy `context="module"`) block are
transformed, keeping their attributes such as `lang="ts"`. Styles in the instance script can use
values and styles of the module script:

```svelte
<script module lang="ts">
  import { css } from "@style-this/core";

  export const accent = "coral";
</script>

<script lang="ts">
  const title = css`
    color: ${accent};
  `;
</script>
```

There's no `styled` for Svelte. Use `css` with custom properties for dynamic values (as with
`--bg` above), and [`mergeStyles`](/guides/merging-styles/) to combine classes.

:::note
Styles are plain CSS, not Svelte `<style>` blocks. Svelte-only syntax like `:global(...)` isn't
needed and isn't valid there.
:::

## Atomic mode

Set `atomic: true` and import the entrypoint in your root layout, see
[Atomic CSS](/guides/atomic-css/).

```svelte title="src/routes/+layout.svelte"
<script lang="ts">
  import "@style-this/core/atomic";
</script>
```

## Example

[`sveltekit-3`](https://github.com/shiro/style-this/tree/master/examples/sveltekit-3)
