# @style-this/next

Next.js integration for [style-this](https://style-this.usagi.io), zero-runtime CSS-in-JS. Supports the app and pages
routers on webpack and turbopack.

```bash
pnpm add @style-this/core @style-this/next
```

```js
// next.config.mjs
import { withStyleThis } from "@style-this/next";

export default withStyleThis({
  // your Next.js config
});
```

Set `ATOMIC=1` to enable atomic mode.

Documentation: [style-this.usagi.io/frameworks/next/](https://style-this.usagi.io/frameworks/next/)
