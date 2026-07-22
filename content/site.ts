export type Category =
  | "monoprint-ink"
  | "printmaking-collage";

export const CATEGORIES: ReadonlyArray<{ value: Category; label: string }> = [
  { value: "monoprint-ink",       label: "Monoprint & Ink" },
  { value: "printmaking-collage", label: "Printmaking & Collage" },
];

// Exhaustive over Category — adding a new variant forces an answer here,
// so the medium label can never silently fall back to a wrong default.
export const DEFAULT_MEDIUM_BY_CATEGORY: Record<Category, string> = {
  "monoprint-ink":       "Monoprint",
  "printmaking-collage": "Linocut collage",
};

export function mediumOf(project: Pick<Project, "medium" | "category">): string {
  if (project.medium) return project.medium;
  if (project.category) return DEFAULT_MEDIUM_BY_CATEGORY[project.category];
  return "Mixed media";
}

/**
 * Card/detail subtitle, derived as "size | year | medium" from the fields it
 * would otherwise repeat verbatim - never stored, so it cannot drift.
 */
export function taglineOf(
  project: Pick<Project, "size" | "year" | "medium" | "category">,
): string | null {
  const parts = [project.size, project.year, mediumOf(project)].filter(Boolean);
  return parts.length > 0 ? parts.join(" | ") : null;
}

export type ExtraImage = {
  src: string;
  width: number;
  height: number;
  /** Screen-reader description. Distinct from `label`/`note`, which are visible catalog text. */
  alt?: string;
  /** Short visible mono caption — e.g. "STITCH" or "REVERSE". Rendered uppercase, tracked-out. */
  label?: string;
  /** Optional sub-caption — sentence-case prose, e.g. "Detail of the cross-stitch lattice." */
  note?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Physical dimensions, e.g. "31 × 41 cm" - surfaces in the derived tagline (see `taglineOf`). */
  size: string | null;
  /** Long-form description for the detail page. Null until written. */
  body: string | null;
  /** Year(s) the work was made — exposed as brutalist metadata stamp. */
  year: string | null;
  /** Medium label, e.g. "Linocut + Watercolor". */
  medium: string | null;
  /** Body of work this piece belongs to. Null = unclassified (only shown under "All"). */
  category: Category | null;
  /** Hero image — path under /public. */
  image: string;
  /** Intrinsic dimensions of the image (for next/image). */
  width: number;
  height: number;
  /** Optional gallery of additional images of the same work, rendered on the detail page. */
  extraImages?: ExtraImage[];
};

export const SITE = {
  name: "Moirae Moss",
  artist: "Teomira Smilenova",
  tagline: "Exploring the intersection of shadows, human form, and organic textures.",
  /** Short bio — the only real prose published on moiraemoss.com today. */
  bio: `Behind the brand Moirae Moss stands Teomira Smilenova, a visual artist who holds a Bachelor's degree in Visual Arts from Sofia University "St. Kliment Ohridski". Her practice is a dynamic intersection of structured graphic form and expressive, vivid color. Moving beyond the constraints of traditional analog printmaking, she merges the precision of linocut with the ethereal fluidity of watercolor to construct intricate visual narratives. Through figurative and symbolic subjects, Teomira explores themes of transformation and identity, utilizing the tension between raw texture, definitive lines, and vibrant hues as her primary visual language.`,
  /** Bio mentions Sofia University but not where the artist currently lives. */
  location: null as string | null, // TODO: confirm and set, e.g. "Sofia, Bulgaria"
  email: "artteomira@gmail.com",
  social: {
    instagram: "moiraemoss",
    tiktok: "moiraemoss",
    pinterest: "moiraemoss",
  },
  portrait: {
    src: "/art/about/69f6b7a58fdd.jpg",
    width: 454,
    height: 635,
  },
  logo: {
    src: "/logo.jpg",
    width: 254,
    height: 222,
    // The logo's sage/olive tone lives as the `--color-mute` / `--color-accent`
    // tokens in app/globals.css - the single source of truth for the accent.
  },
  /**
   * The M monogram image that stands in for the leading letter of `name` in
   * the hero wordmark (components/Hero.tsx). `letter` records which letter it
   * replaces; a build-time check below keeps it aligned with `name`.
   */
  monogram: {
    src: "/m-monogram.webp",
    width: 496,
    height: 400,
    letter: "M",
  },
  /**
   * Canonical site origin. **No trailing slash** - it feeds `new URL(...)`.
   * Absolute page URLs (sitemap, canonicals, JSON-LD) are built via
   * `lib/urls.ts#pageUrl`, which owns the trailing-slash convention that
   * `trailingSlash: true` in next.config.ts imposes; only file URLs
   * (e.g. robots' sitemap.xml) concatenate on this directly.
   */
  url: "https://moiraemoss.com",
} as const;

export type SocialPlatform = keyof typeof SITE.social;

// Exhaustive over SocialPlatform - adding a handle to `SITE.social` forces a
// profile-URL rule here, so it reaches every consumer of SOCIAL_PROFILES.
const SOCIAL_PROFILE_URL: Record<SocialPlatform, string> = {
  instagram: `https://www.instagram.com/${SITE.social.instagram}`,
  tiktok:    `https://www.tiktok.com/@${SITE.social.tiktok}`,
  pinterest: `https://www.pinterest.com/${SITE.social.pinterest}/`,
};

/**
 * Public profile per social handle, in display order. The single source for
 * the contact-page links and the JSON-LD `sameAs` array - a handle added to
 * `SITE.social` reaches both without further wiring.
 */
export const SOCIAL_PROFILES: ReadonlyArray<{
  platform: SocialPlatform;
  handle: string;
  url: string;
}> = (Object.keys(SITE.social) as SocialPlatform[]).map((platform) => ({
  platform,
  handle: SITE.social[platform],
  url: SOCIAL_PROFILE_URL[platform],
}));

/**
 * Mailchimp embedded-form action URL (the `action` from Audience → Signup forms
 * → Embedded form). It is public, not secret — the same `u`/`id` ship inside any
 * embedded Mailchimp form. Kept here as the single source of truth: the JSONP
 * endpoint and the anti-bot honeypot field name are both derived from it in
 * `lib/mailchimp.ts`, so swapping audiences means editing only this line.
 */
export const MAILCHIMP_URL =
  "https://moiraemoss.us7.list-manage.com/subscribe/post?u=88840ac2714ae8bb3f41c47be&id=130f874e34&f_id=009db2e4f0";

export const PROJECTS: Project[] = [
  // ── Monoprint & Ink ──
  {
    slug: "midnight-bloom",
    title: "Midnight Bloom",
    size: "31 × 41 cm",
    body: null,
    year: "2026",
    medium: "Gel plate & natural materials",
    category: "monoprint-ink",
    image: "/art/home/midnight-bloom.webp",
    width: 1600,
    height: 2000,
  },
  {
    slug: "echoes-of-a-rose",
    title: "Echoes of a Rose",
    size: "22 × 35 cm",
    body: null,
    year: "2026",
    medium: "Mixed-media Gelli plate monoprint",
    category: "monoprint-ink",
    image: "/art/home/echoes-of-a-rose.webp",
    width: 1600,
    height: 2000,
  },
  {
    slug: "verde",
    title: "Verde",
    size: "22 × 35 cm",
    body: null,
    year: "2026",
    medium: "Mixed-media Gelli plate monoprint",
    category: "monoprint-ink",
    image: "/art/home/verde.webp",
    width: 1600,
    height: 2000,
  },
  {
    slug: "cyclical-dissonance",
    title: "Cyclical Dissonance",
    size: "30 × 42 cm",
    body: "Selected for presentation in Dissonances, a national contemporary visual arts exhibition-competition held at the Art Gallery – Ruse (14 March – 12 April 2026), bringing together 147 artists from across Bulgaria.",
    year: "2026",
    medium: "Ink, pen and brush on paper",
    category: "monoprint-ink",
    image: "/art/home/cyclical-dissonance.webp",
    width: 1800,
    height: 1028,
  },
  {
    slug: "stardust",
    title: "Stardust",
    size: "12 × 28 cm",
    body: null,
    year: "2020",
    medium: "Siligraphy, toner-lavis",
    category: "monoprint-ink",
    image: "/art/home/stardust.webp",
    width: 1600,
    height: 2000,
  },
  // ── Printmaking & Collage ──
  {
    slug: "the-fabric-of-touch",
    title: "The Fabric of Touch",
    size: "54 × 58 cm",
    body: null,
    year: "2026",
    medium: "Linocut on reclaimed woven polypropylene, framed with raw branches",
    category: "printmaking-collage",
    image: "/art/home/the-fabric-of-touch.webp",
    width: 1440,
    height: 1390,
  },
  {
    slug: "indigo-lake",
    title: "Indigo Lake",
    size: "65 × 42 cm",
    body: null,
    year: "2026",
    medium: "Linocut on a sisal sack with natural wood",
    category: "printmaking-collage",
    image: "/art/home/indigo-lake.webp",
    width: 1600,
    height: 2000,
  },
  {
    slug: "saturn",
    title: "Saturn",
    size: "50 × 80 cm",
    body: null,
    year: "2023",
    medium: "Deconstructed linocut collage on raw burlap",
    category: "printmaking-collage",
    image: "/art/home/saturn-collage.webp",
    width: 1440,
    height: 1746,
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);

// The home-page carousel runs in its own order, independent of the Work grid
// (which follows PROJECTS). Listed slugs come first in this order; any project
// not listed is appended in PROJECTS order, so a newly added piece can never
// silently vanish from the carousel.
const HOME_CAROUSEL_ORDER: ReadonlyArray<string> = [
  "the-fabric-of-touch",
  "verde",
  "saturn",
  "cyclical-dissonance",
  "echoes-of-a-rose",
  "stardust",
  "midnight-bloom",
  "indigo-lake",
];

export const HOME_CAROUSEL: Project[] = [
  ...HOME_CAROUSEL_ORDER
    .map(projectBySlug)
    .filter((p): p is Project => p !== undefined),
  ...PROJECTS.filter((p) => !HOME_CAROUSEL_ORDER.includes(p.slug)),
];

/**
 * Default social share card (1200x630 JPEG), used as the Open Graph / Twitter
 * image for any page that doesn't supply its own. Next.js replaces (rather than
 * deep-merges) a child route's `openGraph`, so every page with a custom
 * openGraph block must spread this in explicitly or it ships with no preview.
 */
export const OG_IMAGE = {
  url: "/og-default.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE.name} - ${SITE.artist}`,
} as const;

// ── Build-time content invariants ────────────────────────────────────────────
// Content modules are evaluated during `next build` (static export), so a
// throw here fails the build instead of shipping a broken page.

function assertContent(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`content/site.ts: ${message}`);
}

{
  const seen = new Set<string>();
  for (const p of PROJECTS) {
    assertContent(
      !seen.has(p.slug),
      `duplicate project slug "${p.slug}" - projectBySlug resolves by slug`,
    );
    seen.add(p.slug);
  }
  assertContent(
    SITE.name.startsWith(SITE.monogram.letter),
    `SITE.name "${SITE.name}" must start with the monogram letter ` +
      `"${SITE.monogram.letter}" - the hero renders the monogram image in place of that letter`,
  );
}
