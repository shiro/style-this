# @style-this/vite

Vite plugin for the style-this library.

## Installation

```bash
pnpm add -D @style-this/vite
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import styleThis from '@style-this/vite';

export default defineConfig({
  plugins: [
    styleThis()
  ]
});
```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev
```

