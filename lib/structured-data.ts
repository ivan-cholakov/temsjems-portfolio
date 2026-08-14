import { mediumOf, SITE, SOCIAL_PROFILES, type Project } from "@/content/site";
import type { Post } from "@/content/blog";
import { pageUrl } from "@/lib/urls";

const SCHEMA_CONTEXT = "https://schema.org";

/** Derived from SOCIAL_PROFILES so a new handle reaches JSON-LD automatically. */
const sameAs: string[] = SOCIAL_PROFILES.map((p) => p.url);

const portraitUrl = new URL(SITE.portrait.src, SITE.url).toString();

export function websiteSchema() {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: SITE.name,
    url: pageUrl("/"),
    author: { "@type": "Person", name: SITE.artist },
  } as const;
}

export function personSchema() {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Person",
    name: SITE.artist,
    alternateName: SITE.name,
    description: SITE.bio,
    url: pageUrl("/"),
    image: portraitUrl,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: 'Sofia University "St. Kliment Ohridski"',
    },
    knowsAbout: ["Linocut", "Watercolor", "Printmaking", "Visual narrative"],
    jobTitle: "Visual artist",
    sameAs,
  } as const;
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
    url: pageUrl(`/work/${project.slug}`),
  };
  return project.body ? { ...base, description: project.body } : base;
}

export function blogPostingSchema(post: Post) {
  const url = pageUrl(`/blog/${post.slug}`);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    image: new URL(post.cover.src, SITE.url).toString(),
    datePublished: post.date,
    dateModified: post.date,
    // sameAs identifies the author's other profiles, so it belongs on the
    // author entity, not on the posting itself.
    author: { "@type": "Person", name: post.author, sameAs },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  } as const;
}
