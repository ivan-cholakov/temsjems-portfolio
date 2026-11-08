import type { AnalyticsEvent } from "@/lib/analytics";

type SeriesEntry = {
  slug: string;
  /** As the Work menu prints it, and the heading of the series page. */
  title: string;
  /** Short text set under the heading. Null until the artist supplies it. */
  intro: string | null;
};

/**
 * The bodies of work the Work menu offers, in menu order. Every work belongs to
 * exactly one, so there is no unfiled state and no "all works" filter to build:
 * "Other work" is where a piece goes when it is not part of a series.
 */
const SERIES_ENTRIES = [
  { slug: "the-fabric-of",       title: "The Fabric of",       intro: null },
  { slug: "ex-libris",           title: "Ex libris",           intro: null },
  { slug: "cyclical-dissonance", title: "Cyclical Dissonance", intro: null },
  { slug: "other-work",          title: "Other work",          intro: null },
] as const satisfies ReadonlyArray<SeriesEntry>;

/** The slug union is read off the list, so a series cannot be named without being listed. */
export type SeriesSlug = (typeof SERIES_ENTRIES)[number]["slug"];
export type Series = SeriesEntry & { slug: SeriesSlug };

export const SERIES: ReadonlyArray<Series> = SERIES_ENTRIES;

export function seriesBySlug(slug: SeriesSlug): Series {
  const series = SERIES.find((s) => s.slug === slug);
  if (!series) throw new Error(`No series: ${slug}`);
  return series;
}

export const seriesPath = (slug: SeriesSlug): string => `/work/series/${slug}`;

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
  series: SeriesSlug;
  /** Physical dimensions as the artist writes them, e.g. "54 × 58 cm". */
  size: string | null;
  /** Year(s) the work was made. */
  year: string | null;
  /** Technique and support, e.g. "Ink, pen and brush on paper". */
  medium: string | null;
  /** Long-form description for the detail page. Null until written. */
  body: string | null;
  /** Hero image - path under /public. Works are photographed at 4:5, 2000 × 2500. */
  image: string;
  /** Intrinsic dimensions of the image (for next/image). */
  width: number;
  height: number;
  /** Optional gallery of additional images of the same work, rendered on the detail page. */
  extraImages?: ExtraImage[];
};

export type CatalogDetail = { label: "Size" | "Year" | "Technique"; value: string };

/** The catalog line of a work - size, year, technique - leaving out what is not yet known. */
export function catalogDetails(project: Project): CatalogDetail[] {
  const details: Array<{ label: CatalogDetail["label"]; value: string | null }> = [
    { label: "Size", value: project.size },
    { label: "Year", value: project.year },
    { label: "Technique", value: project.medium },
  ];
  return details.filter((d): d is CatalogDetail => d.value !== null);
}

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
   * the artist's JSON-LD `description` is derived from it via `runsText`.
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
  email: "contact@moiraemoss.com",
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
    heading: "Residencies",
    yearSeparator: ",",
    entries: [
      {
        year: "2026",
        work: { lead: null, title: "PAKT – Artivist Residency" },
        venue:
          "GLAS Foundation & Community Centre “Badeshte Sega 2006”, Gudevitsa, Rhodope Mountains",
      },
    ],
  },
  {
    heading: "Exhibitions",
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
        work: { lead: null, title: "Monoprint Workshop" },
        venue: "Magnit, Sofia",
      },
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

/** In series order, and within a series in the order its page shows the works. */
export const PROJECTS: Project[] = [
  // ── The Fabric of ──
  {
    slug: "the-fabric-of-touch",
    title: "The Fabric of Touch",
    series: "the-fabric-of",
    size: "54 × 58 cm",
    year: "2026",
    medium: "Linocut on reclaimed woven polypropylene, framed with raw branches",
    body: null,
    image: "/art/work/the-fabric-of-touch.webp",
    width: 2000,
    height: 2500,
  },
  {
    slug: "the-fabric-of-threads",
    title: "The Fabric of Threads",
    series: "the-fabric-of",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/the-fabric-of-threads.webp",
    width: 2000,
    height: 2500,
  },
  {
    slug: "the-fabric-of-grasping",
    title: "The Fabric of Grasping",
    series: "the-fabric-of",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/the-fabric-of-grasping.webp",
    width: 2000,
    height: 2500,
  },
  // ── Ex libris ──
  {
    slug: "spirit-of-the-stage",
    title: "Spirit of the Stage",
    series: "ex-libris",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/spirit-of-the-stage.webp",
    width: 2000,
    height: 2500,
  },
  {
    slug: "ivan-vazov-national-theatre",
    title: "Ivan Vazov National Theatre",
    series: "ex-libris",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/ivan-vazov-national-theatre.webp",
    width: 2000,
    height: 2500,
  },
  {
    slug: "ancient-theatre-plovdiv",
    title: "Ancient Theatre Plovdiv",
    series: "ex-libris",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/ancient-theatre-plovdiv.webp",
    width: 2000,
    height: 2500,
  },
  {
    slug: "vrana-palace",
    title: "Vrana Palace",
    series: "ex-libris",
    size: null,
    year: null,
    medium: null,
    body: null,
    image: "/art/work/vrana-palace.webp",
    width: 2000,
    height: 2500,
  },
  // ── Cyclical Dissonance ──
  {
    slug: "cyclical-dissonance",
    title: "Cyclical Dissonance",
    series: "cyclical-dissonance",
    size: "30 × 42 cm",
    year: "2026",
    medium: "Ink, pen and brush on paper",
    body: "Selected for presentation in Dissonances, a national contemporary visual arts exhibition-competition held at the Art Gallery – Ruse (14 March – 12 April 2026), bringing together 147 artists from across Bulgaria.",
    image: "/art/home/cyclical-dissonance.webp",
    width: 1800,
    height: 1028,
  },
  {
    slug: "stardust",
    title: "Stardust",
    series: "cyclical-dissonance",
    size: "12 × 28 cm",
    year: "2020",
    medium: "Siligraphy, toner-lavis",
    body: null,
    image: "/art/home/stardust.webp",
    width: 1600,
    height: 2000,
  },
  // ── Other work ──
  {
    slug: "indigo-lake",
    title: "Indigo Lake",
    series: "other-work",
    size: "65 × 42 cm",
    year: "2026",
    medium: "Linocut on a sisal sack with natural wood",
    body: null,
    image: "/art/home/indigo-lake.webp",
    width: 1600,
    height: 2000,
  },
  {
    slug: "saturn",
    title: "Saturn",
    series: "other-work",
    size: "50 × 80 cm",
    year: "2023",
    medium: "Deconstructed linocut collage on raw burlap",
    body: null,
    image: "/art/home/saturn.png",
    width: 1690,
    height: 2048,
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);

export const projectsInSeries = (slug: SeriesSlug): Project[] =>
  PROJECTS.filter((p) => p.series === slug);

// The home-page carousel runs in its own order, independent of the Work grid
// (which follows PROJECTS). Listed slugs come first in this order; any project
// not listed is appended in PROJECTS order, so a newly added piece can never
// silently vanish from the carousel.
const HOME_CAROUSEL_ORDER: ReadonlyArray<string> = [
  "the-fabric-of-touch",
  "saturn",
  "cyclical-dissonance",
  "stardust",
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
