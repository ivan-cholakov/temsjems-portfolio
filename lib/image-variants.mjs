/**
 * Single source of truth for the responsive image pipeline.
 *
 * The site is a static export, so there is no image optimizer at request
 * time. Instead `scripts/generate-image-variants.mjs` pre-renders every
 * content image at these widths into `public/_optimized/w{width}/...`, and
 * the next/image custom loader (`lib/image-loader.ts`) maps a requested
 * width onto the same tiers. Both sides import this module, so the tier
 * list cannot drift between generator and loader.
 *
 * next.config.ts imports `IMAGE_SIZES` / `DEVICE_SIZES` for
 * `images.imageSizes` / `images.deviceSizes`, so the union of tiers
 * next/image can request is exactly `VARIANT_WIDTHS` by construction.
 */

/** Widths for fixed-size images (next.config.ts `images.imageSizes`). */
export const IMAGE_SIZES = [128, 256];

/** Viewport-driven widths (next.config.ts `images.deviceSizes`). */
export const DEVICE_SIZES = [384, 640, 828, 1080, 1600];

/** All generated tiers, ascending - `variantSrc` relies on the order. */
export const VARIANT_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];

/**
 * Path of the pre-generated variant that serves a requested width: the
 * smallest tier that still covers it (or the largest tier as a cap).
 *
 * @param {string} src - image path under /public, e.g. "/art/home/verde.webp"
 * @param {number} width - width requested by next/image
 * @returns {string}
 */
export function variantSrc(src, width) {
  const tier =
    VARIANT_WIDTHS.find((w) => w >= width) ??
    VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
  return `/_optimized/w${tier}${src}`;
}
