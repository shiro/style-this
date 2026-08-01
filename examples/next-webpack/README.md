# next-webpack

Next.js example using Next.js 15.5+ (currently without @style-this integration due to transformer compatibility issues).

**Note**: This example demonstrates the same Counter component as the other examples, but uses inline styles instead of style-this transforms. Full style-this support for Next.js requires resolving WASM transformer compatibility issues in the Next.js build environment.

## Features

- ✅ Same Counter component structure as React/Solid examples
- ✅ Next.js 15.5+ with both webpack and Turbopack support
- ⚠️  Currently uses inline styles instead of style-this transforms

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building

Next.js 15 uses webpack by default for production builds:

```bash
# Build with default bundler
pnpm build

# Start production server
pnpm start
```

## Future Work

- Fix WASM transformer compatibility in Next.js environment
- Enable style-this `css` and `styled` usage
- Support both webpack and Turbopack modes
