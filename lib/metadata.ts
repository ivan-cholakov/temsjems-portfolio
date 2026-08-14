import type { Metadata } from "next";

import { OG_IMAGE, SITE } from "@/content/site";
import { pagePath } from "@/lib/urls";

/**
 * Standard metadata for a page. Centralises two conventions every page must
 * follow but nothing previously enforced:
 *
 * - canonical and og:url use the trailing-slash form the site actually serves
 *   (`trailingSlash: true` in next.config.ts) via `pagePath`;
 * - every openGraph block ships the default share card. Next.js replaces
 *   (rather than deep-merges) a child route's `openGraph`, so a page building
 *   its own block from scratch can silently drop the image - building it here
 *   makes that impossible.
 *
 * `og` is merged over the defaults for page-specific fields (type, images,
 * publishedTime, a shorter share description, ...).
 */
export function pageMetadata({
  title,
  description,
  path,
  og,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/work/saturn". */
  path: string;
  og?: NonNullable<Metadata["openGraph"]>;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pagePath(path) },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description,
      url: pagePath(path),
      images: [OG_IMAGE],
      ...og,
    },
  };
}
