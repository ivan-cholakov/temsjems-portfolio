import { SITE } from "@/content/site";

/**
 * Canonical form of a page path under `trailingSlash: true` (next.config.ts):
 * every page URL the site serves ends in "/". Building canonical/sitemap/JSON-LD
 * URLs through these helpers is what keeps them from pointing at 308-redirecting
 * slash-less variants. File URLs (sitemap.xml, images) are exempt from the
 * trailing-slash rule and should not go through here.
 */
export function pagePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** Absolute canonical URL for a page path, e.g. pageUrl("/work") -> "https://moiraemoss.com/work/". */
export function pageUrl(path: string): string {
  return new URL(pagePath(path), SITE.url).toString();
}
