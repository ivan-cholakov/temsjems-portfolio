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
 * Tiers must equal `images.imageSizes` + `images.deviceSizes` in
 * next.config.ts - next/image only ever requests widths from that union.
 */
export const VARIANT_WIDTHS = [128, 256, 384, 640, 828, 1080, 1600];

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
