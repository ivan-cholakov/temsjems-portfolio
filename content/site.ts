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

export const PROJECTS: Project[] = [
  // ── Monoprint & Ink ──
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
  // ── Printmaking & Collage ──
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
    slug: "thread-form",
    title: "Thread & Form",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "printmaking-collage",
    image: "/art/home/88857e5b2d52.png",
    width: 1440,
    height: 1390,
    extraImages: [
      {
        src: "/art/work/thread-form/detail-01.webp",
        width: 1500,
        height: 2000,
        alt: "Corner detail of Thread & Form: black-and-white linocut printed on muslin, stitched into a raw fabric border, mounted on a hand-lashed twig frame with jute cord binding at the corners.",
        label: "CORNER STUDY",
        note: "Hand-lashed twig frame, jute cord binding at the corners.",
      },
    ],
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
