import { mediumOf, runsText, SITE, SOCIAL_CHANNELS, type Project } from "@/content/site";
import type { Post } from "@/content/blog";

const SCHEMA_CONTEXT = "https://schema.org";

const sameAs: string[] = SOCIAL_CHANNELS.map((channel) => channel.url);

function withSameAs<T extends object>(obj: T): T & { sameAs?: string[] } {
  return sameAs.length > 0 ? { ...obj, sameAs } : obj;
}

const portraitUrl = new URL(SITE.portrait.src, SITE.url).toString();

/** The published bio, flattened: schema.org `description` takes no markup. */
const bioText = runsText(SITE.bio);

/**
 * What the artist practises, for schema.org `knowsAbout`. Stated rather than
 * derived from `SITE.keywords`: that list is search vocabulary in the artist's
 * own casing and carries terms like her own name and city, which are facts
 * about the page rather than subjects she works in. Overlap with the keywords
 * is expected; the two lists answer different questions and are allowed to
 * diverge. Every block that publishes the artist as an entity emits this set
 * whole, so the site never claims two different practices for one person.
 */
const PRACTICE = [
  "Linocut",
  "Relief printmaking",
  "Printmaking on cloth",
  "Mixed media",
] as const;

export function websiteSchema() {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    author: { "@type": "Person", name: SITE.artist },
  } as const;
}

export function visualArtistSchema() {
  return withSameAs({
    "@context": SCHEMA_CONTEXT,
    "@type": "VisualArtist",
    name: SITE.artist,
    alternateName: SITE.name,
    description: bioText,
    url: SITE.url,
    image: portraitUrl,
    knowsAbout: [...PRACTICE],
  });
}

export function personSchema() {
  return withSameAs({
    "@context": SCHEMA_CONTEXT,
    "@type": "Person",
    name: SITE.artist,
    alternateName: SITE.name,
    description: bioText,
    url: SITE.url,
    image: portraitUrl,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Sofia University “St. Kliment Ohridski”",
    },
    knowsAbout: [...PRACTICE],
    jobTitle: "Visual artist",
  });
}

export function artworkSchema(project: Project) {
  const base = {
    "@context": SCHEMA_CONTEXT,
    "@type": "VisualArtwork",
    name: project.title,
    creator: { "@type": "Person", name: SITE.artist },
    artform: "Printmaking",
    artMedium: mediumOf(project),
    image: new URL(project.image, SITE.url).toString(),
    url: new URL(`/work/${project.slug}`, SITE.url).toString(),
  };
  return project.body ? { ...base, description: project.body } : base;
}

export function blogPostingSchema(post: Post) {
  const url = new URL(`/blog/${post.slug}`, SITE.url).toString();
  return withSameAs({
    "@context": SCHEMA_CONTEXT,
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: new URL(post.cover.src, SITE.url).toString(),
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  });
}
