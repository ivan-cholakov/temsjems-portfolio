"use client";

import { variantSrc } from "./image-variants.mjs";

/**
 * next/image custom loader for the static export (next.config.ts
 * `images.loaderFile`). Serves the pre-generated variant matching the
 * requested width - see lib/image-variants.mjs for the pipeline contract.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return variantSrc(src, width);
}
