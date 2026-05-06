import { mediumOf, SITE, type Project } from "@/content/site";

const SCHEMA_CONTEXT = "https://schema.org";

const sameAs: string[] | undefined = SITE.social.instagram
  ? [`https://www.instagram.com/${SITE.social.instagram}`]
  : undefined;

function withSameAs<T extends object>(obj: T): T & { sameAs?: string[] } {
  return sameAs ? { ...obj, sameAs } : obj;
}

const portraitUrl = new URL(SITE.portrait.src, SITE.url).toString();

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
    description: SITE.bio,
    url: SITE.url,
    image: portraitUrl,
    knowsAbout: ["Linocut", "Watercolor", "Printmaking"],
  });
}

export function personSchema() {
  return withSameAs({
    "@context": SCHEMA_CONTEXT,
    "@type": "Person",
    name: SITE.artist,
    alternateName: SITE.name,
    description: SITE.bio,
    url: SITE.url,
    image: portraitUrl,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: 'Sofia University "St. Kliment Ohridski"',
    },
    knowsAbout: ["Linocut", "Watercolor", "Printmaking", "Visual narrative"],
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
