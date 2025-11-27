# @style-this/webpack

CSS-in-JS library for the modern web - webpack plugin

## Installation

```bash
npm install @style-this/webpack
# or
pnpm add @style-this/webpack
# or
yarn add @style-this/webpack
```

## Usage

### Basic Usage

```javascript
// webpack.config.js
import styleThisWebpackPlugin from '@style-this/webpack';

export default {
  // ... other webpack config
  plugins: [
    styleThisWebpackPlugin({
      // options
    })
  ]
};
```

### With SolidJS

```javascript
// webpack.config.js
import styleThisWebpackPlugin from '@style-this/webpack';
import styleThisSolidJsWebpackPlugin from '@style-this/webpack/solid-js';

export default {
  // ... other webpack config
  plugins: [
    styleThisWebpackPlugin({
      // options
    }),
    styleThisSolidJsWebpackPlugin({
      // options
    })
  ]
};
```

## Options

### Main Plugin Options

- `include?: RegExp[]` - Array of RegExp patterns to include files
- `exclude?: RegExp[]` - Array of RegExp patterns to exclude files
- `cssExtension?: string` - CSS file extension (default: "css")
- `filter?: Filter | Filter[]` - Custom filter function(s) or RegExp(s)

### SolidJS Plugin Options

- `filter?: Filter | Filter[]` - Custom filter function(s) or RegExp(s)

## Type Definitions

```typescript
type Filter = RegExp | ((filepath: string) => boolean);
```

## License

MIT

