---
title: Versioning the docs
description: How per-release documentation is maintained.
sidebar:
  order: 2
---

The docs are versioned per minor release with
[`starlight-versions`](https://starlight-versions.vercel.app/). The pages in
`docs/src/content/docs/` always describe the **latest** release, older releases are frozen copies
in `docs/src/content/docs/<version>/`.

## Cutting a release

Right **before** documenting a new minor release, archive the current docs under the version they
describe:

1. Add the outgoing version to the **front** of `versions` in `docs/astro.config.mjs`:

   ```js
   starlightVersions({
     current: { label: "v0.5 (latest)" },
     versions: [{ slug: "0.4", label: "v0.4" }, { slug: "0.3", label: "v0.3" }],
   });
   ```

2. Run `pnpm dev` or `pnpm build` in `docs/`. The plugin copies the current pages to
   `src/content/docs/0.4/` and writes `src/content/versions/0.4.json`. Only one new version can be
   added per run.
3. Commit the generated files.
4. Update the unversioned pages for the new release and add its notes to the
   [changelog](/releases/changelog/).

Patch releases don't get their own version, fix the affected pages in place.

## Fixing archived docs

Archived versions are plain Markdown, edit the files in `src/content/docs/<version>/` directly.
They're never regenerated.

## Unversioned pages

Pages under `releases/` are excluded from versioning and always show the latest content.
