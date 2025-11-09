# @style-this/core

Core functionality for the style-this library with WebAssembly bindings.

## Installation

```bash
pnpm add @style-this/core
```

## Usage

```typescript
import { init, css, initialize } from '@style-this/core';

// Initialize the WebAssembly module
await init();

// Use the CSS functionality
const styles = css`
  color: red;
  font-size: 16px;
`;
```

## Development

```bash
# Build the native WebAssembly module
pnpm build:native

# Build the JavaScript package
pnpm build:js

# Build everything
pnpm build

# Watch mode for development
pnpm dev
```

