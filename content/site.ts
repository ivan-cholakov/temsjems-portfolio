export type Category =
  | "gel-plate-monoprint"
  | "linocut-collage"
  | "ink-work"
  | "textile-print-making";

export const CATEGORIES: ReadonlyArray<{ value: Category; label: string }> = [
  { value: "gel-plate-monoprint",  label: "Gel Plate Monoprints" },
  { value: "linocut-collage",      label: "Linocut Collages" },
  { value: "ink-work",             label: "Ink Works" },
  { value: "textile-print-making", label: "Textile Print-making" },
];

// Exhaustive over Category — adding a new variant forces an answer here,
// so the medium label can never silently fall back to a wrong default.
export const DEFAULT_MEDIUM_BY_CATEGORY: Record<Category, string> = {
  "gel-plate-monoprint":  "Gel plate monoprint",
  "linocut-collage":      "Linocut + watercolor",
  "ink-work":             "Ink",
  "textile-print-making": "Textile print",
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
  alt?: string | null;
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
  {
    slug: "thread-form",
    title: "Thread & Form",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "textile-print-making",
    image: "/art/home/88857e5b2d52.png",
    width: 1440,
    height: 1390,
  },
  {
    slug: "land-meets-the-sea",
    title: "Land Meets the Sea",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "linocut-collage",
    image: "/art/home/42f49d304a72.png",
    width: 1440,
    height: 1746,
  },
  {
    slug: "stardust",
    title: "Stardust",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "ink-work",
    image: "/art/home/0963d97a6379.png",
    width: 1440,
    height: 1800,
  },
  {
    slug: "cyclical-dissonance",
    title: "Cyclical Dissonance",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "ink-work",
    image: "/art/home/cyclical-dissonance.webp",
    width: 1800,
    height: 1028,
  },
  {
    slug: "violet-strata",
    title: "Violet Strata",
    tagline: null,
    body: null,
    year: null,
    medium: null,
    category: "gel-plate-monoprint",
    image: "/art/home/violet-strata.webp",
    width: 1600,
    height: 2000,
    lcp: true,
  },
];

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
