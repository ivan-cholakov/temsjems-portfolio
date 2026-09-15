import type { AnalyticsEvent } from "@/lib/analytics";

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

export type ExtraImage = {
  src: string;
  width: number;
  height: number;
  /** Screen-reader description. Distinct from `label`/`note`, which are visible catalog text. */
  alt?: string | null;
  /** Short visible mono caption — e.g. "STITCH" or "REVERSE". Rendered uppercase, tracked-out. */
  label?: string | null;
  /** Optional sub-caption — sentence-case prose, e.g. "Detail of the cross-stitch lattice." */
  note?: string | null;
};

export type Project = {
  slug: string;
  title: string;
  /** One-line subtitle used on cards and detail hero. */
  tagline: string | null;
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
  /**
   * LCP hint. If this image tends to be the Largest Contentful Paint when
   * shown in a list (gallery / carousel), set true so consumers can pass
   * `priority` to next/image regardless of position-based heuristics.
   */
  lcp?: boolean;
};

/**
 * One run of About-page prose. The split is two-way rather than a general
 * rich-text tree because exactly one thing changes typographically mid-
 * sentence: art-CV convention sets show and work titles in italics and leaves
 * institution names roman.
 */
export type ProseRun =
  | { kind: "text"; text: string }
  | { kind: "title"; text: string };

/**
 * The same prose as one unstyled string, for meta descriptions and JSON-LD -
 * both take plain text, so the italics are dropped rather than duplicated as a
 * second hand-written copy that could drift from the rendered one.
 */
export function runsText(runs: ReadonlyArray<ProseRun>): string {
  return runs.map((run) => run.text).join("");
}

export const SITE = {
  name: "Moirae Moss",
  artist: "Teomira Smilenova",
  tagline: "Exploring the intersection of shadows, human form, and organic textures.",
  /**
   * Artist statement, in the artist's own first person - the long-form prose on
   * the About page. Held as paragraphs rather than one blob with newlines in it
   * so the page can space them typographically instead of splitting on "\n".
   */
  statement: [
    "My work begins with a carved block: one form, exact and unmoving, an anchor for the eye. Everything after that is water. Colour spreads, thins, pools and dissolves at the edges, and I let it go where it is already going rather than argue with it.",
    "Nothing beyond that first form is fixed. Ink finds the cloth on its own terms. The image is not resolved before it exists; it arrives through the printing itself, and the work is to recognise it when it does.",
    "I print onto sacks made to carry grain and cement, and hang the pieces from branches gathered off the ground. Neither was meant to be looked at. Here the sack becomes the canvas and the branch holds it.",
    "The same thing happens to the images. A horse's head runs and becomes stardust. Form gives way, edges fail, a shape comes apart into whatever it becomes next. I have stopped treating dissolution as a loss. It is the condition the work is made under, and increasingly the reason for making it.",
  ] satisfies ReadonlyArray<string>,
  /**
   * Third-person biography - the About page prints it under the statement, and
   * every JSON-LD `description` is derived from it via `runsText`.
   */
  bio: [
    { kind: "text",  text: 'Teomira Smilenova (b. 1999, Pazardzhik) is a printmaker living and working in Sofia. She studied Fine Arts at Sofia University “St. Kliment Ohridski”, graduating in 2022 with her series ' },
    { kind: "title", text: "Pagan Tarot" },
    { kind: "text",  text: ". She works primarily in relief printmaking, extending it beyond paper onto alternative supports, most often cloth, and into mixed media. Natural motifs and impressions taken from natural materials, made with a gel plate, run through the work. Recent exhibitions include the national exhibition " },
    { kind: "title", text: "Dissonances" },
    { kind: "text",  text: " at Ruse Art Gallery and the international " },
    { kind: "title", text: "FISAE" },
    { kind: "text",  text: " forum in Varna. She works under the name Moirae Moss." },
  ] satisfies ReadonlyArray<ProseRun>,
  /**
   * Default meta description - one sentence, short enough to survive a search
   * result intact. Stated rather than sliced off the bio: a truncated sentence
   * is what a reader sees in the SERP, and the cut landed mid-clause.
   */
  metaDescription:
    "Teomira Smilenova is a printmaker based in Sofia, working in relief printmaking on cloth and alternative supports.",
  /**
   * The search vocabulary the artist wants the site to answer to, in her own
   * wording. Copy, not configuration, so it belongs beside the rest of the
   * copy rather than inside the root layout that happens to emit it. Not the
   * same list as JSON-LD `knowsAbout`, which names practices rather than
   * search terms - see `lib/structured-data.ts`.
   */
  keywords: [
    "Teomira Smilenova",
    "Moirae Moss",
    "linocut",
    "relief printmaking",
    "printmaking on cloth",
    "Bulgarian visual artist",
    "Sofia",
    "contemporary art",
  ],
  email: "artteomira@gmail.com",
  portrait: {
    src: "/art/about/portrait.webp",
    width: 1120,
    height: 1680,
  },
  logo: {
    src: "/logo.jpg",
    width: 254,
    height: 222,
    /** Sage/olive — the dominant tone in the M monogram, used as the
     *  site's accent color (eyebrow labels, hover states). */
    color: "#A0A876",
  },
  /**
   * Canonical site origin. **No trailing slash** — consumers concatenate paths
   * like `${SITE.url}/work` directly and feed it to `new URL(...)` callers.
   * Keeping this invariant at the source means sitemap/robots/JSON-LD don't
   * need defensive trim logic.
   */
  url: "https://moiraemoss.com",
} as const;

export type SocialPlatform = "instagram" | "tiktok" | "pinterest";

export type SocialChannel = {
  platform: SocialPlatform;
  /** Platform name as a reader says it, e.g. "TikTok". */
  label: string;
  /** Handle without the leading "@". */
  handle: string;
  /** Public profile URL. Stated rather than derived: each platform shapes it differently. */
  url: string;
  /** Plausible event fired when a reader follows the link. */
  event: AnalyticsEvent;
};

/**
 * Every social profile the artist publishes, in the order the contact page
 * lists them. Single source of truth: the contact page renders from this list
 * and every JSON-LD block that carries `sameAs` builds it from the same URLs,
 * so a new profile is one edit here rather than three that can drift apart.
 */
export const SOCIAL_CHANNELS: readonly SocialChannel[] = [
  {
    platform: "instagram",
    label: "Instagram",
    handle: "moiraemoss",
    url: "https://www.instagram.com/moiraemoss",
    event: "Outbound: Instagram",
  },
  {
    platform: "tiktok",
    label: "TikTok",
    handle: "moiraemoss",
    url: "https://www.tiktok.com/@moiraemoss",
    event: "Outbound: TikTok",
  },
  {
    platform: "pinterest",
    label: "Pinterest",
    handle: "moiraemoss",
    url: "https://www.pinterest.com/moiraemoss/",
    event: "Outbound: Pinterest",
  },
];

export function socialChannel(platform: SocialPlatform): SocialChannel {
  const channel = SOCIAL_CHANNELS.find((c) => c.platform === platform);
  if (!channel) throw new Error(`No social channel for platform: ${platform}`);
  return channel;
}

export type CvWork = {
  /** Plain qualifier ahead of the title, e.g. "National exhibition". Null when the title opens the line. */
  lead: string | null;
  /** Show or programme title — the one italicised run on the line. */
  title: string;
};

export type CvEntry = {
  /** Year, or inclusive range for multi-year entries: "2026", "2018–2022". */
  year: string;
  /**
   * The named show this line records. Null for entries that name no work —
   * a degree, say — which is why the qualifier lives here rather than beside
   * `year`: a lead with nothing to lead into is not a CV line.
   */
  work: CvWork | null;
  /**
   * Everything after the title: institution then city. No country - the CV as
   * the artist supplied it names cities alone, and the bio above it already
   * places her in Sofia.
   */
  venue: string;
};

export type CvSection = {
  /** Rendered as a mono eyebrow above the list. */
  heading: string;
  /**
   * Punctuation printed straight after the year. Education reads
   * "2018–2022: BA Fine Arts", exhibitions read "2026, Dissonances" - the CV as
   * written mixes the two, so each section states its own.
   */
  yearSeparator: ":" | ",";
  entries: ReadonlyArray<CvEntry>;
};

/**
 * Artist CV, in the order the About page prints it. Held as data rather than a
 * prose blob so the page owns the typography - show titles are italicised per
 * art-CV convention without any markup leaking into content, and the entries
 * stay legible to a future JSON-LD block. Where the artist was born and lives
 * is not repeated here: `SITE.bio`, printed directly above the CV, says it.
 */
export const CV: ReadonlyArray<CvSection> = [
  {
    heading: "Education",
    yearSeparator: ":",
    entries: [
      {
        year: "2018–2022",
        work: null,
        venue: 'BA Fine Arts, Sofia University “St. Kliment Ohridski”, Sofia',
      },
    ],
  },
  {
    heading: "Group exhibitions",
    yearSeparator: ",",
    entries: [
      {
        year: "2026",
        work: { lead: "International forum", title: "FISAE" },
        venue: "Varna",
      },
      {
        year: "2026",
        work: { lead: "National exhibition", title: "Dissonances" },
        venue: "Ruse Art Gallery, Ruse",
      },
      {
        year: "2022",
        work: { lead: "Degree show:", title: "Pagan Tarot" },
        venue: "Faculty of Educational Studies and the Arts, Sofia",
      },
      {
        year: "2019",
        work: { lead: null, title: "Autofocus IV: Graphic Transformations" },
        venue: "Etud Gallery, Sofia",
      },
    ],
  },
  {
    heading: "Workshops",
    yearSeparator: ",",
    entries: [
      {
        year: "2026",
        work: { lead: null, title: "Botanical Impressions" },
        venue: "Toplocentrala, Sofia",
      },
    ],
  },
];

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
    tagline: "31 × 41 cm | 2026 | Gel plate & natural materials",
    body: null,
    year: "2026",
    medium: "Gel plate & natural materials",
    category: "monoprint-ink",
    image: "/art/home/midnight-bloom.webp",
    width: 1600,
    height: 2000,
    lcp: true,
  },
  {
    slug: "echoes-of-a-rose",
    title: "Echoes of a Rose",
    tagline: "22 × 35 cm | 2026 | Mixed-media Gelli plate monoprint",
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
    tagline: "22 × 35 cm | 2026 | Mixed-media Gelli plate monoprint",
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
    tagline: "30 × 42 cm | 2026 | Ink, pen and brush on paper",
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
    tagline: "12 × 28 cm | 2020 | Siligraphy, toner-lavis",
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
    tagline: "54 × 58 cm | 2026 | Linocut on reclaimed woven polypropylene, framed with raw branches",
    body: null,
    year: "2026",
    medium: "Linocut on reclaimed woven polypropylene, framed with raw branches",
    category: "printmaking-collage",
    image: "/art/home/88857e5b2d52.png",
    width: 1440,
    height: 1390,
  },
  {
    slug: "indigo-lake",
    title: "Indigo Lake",
    tagline: "65 × 42 cm | 2026 | Linocut on a sisal sack with natural wood",
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
    tagline: "50 × 80 cm | 2023 | Deconstructed linocut collage on raw burlap",
    body: null,
    year: "2023",
    medium: "Deconstructed linocut collage on raw burlap",
    category: "printmaking-collage",
    image: "/art/home/saturn.png",
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
