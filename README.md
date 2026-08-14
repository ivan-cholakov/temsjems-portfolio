# moirae-moss-site

Portfolio and blog for the artist Moirae Moss.
Built with Next.js as a fully static export (`output: "export"`, `trailingSlash: true`) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Development

```bash
pnpm install
pnpm dev    # generate image variants, then next dev
pnpm build  # generate image variants, then next build (static output in out/)
```

Both `dev` and `build` first run `scripts/generate-image-variants.mjs`, which pre-renders every content image at a fixed set of widths into `public/_optimized/` (gitignored build output; `sharp` is a devDependency).

## Images

There is no image optimizer at request time, so responsive images are pre-generated.
The width tiers are single-sourced in `lib/image-variants.mjs` and imported by the generator, by the custom `next/image` loader (`lib/image-loader.ts`), and by `next.config.ts` for `images.imageSizes` / `images.deviceSizes` - the three cannot drift.

## Editing content

Site content lives in `content/site.ts` (site metadata, projects, home carousel) and `content/blog.ts` (posts).
Both files end with invariant blocks that throw at module init, so a bad content edit (broken slug, missing image, duplicate entry) fails the static build instead of shipping a broken page.
