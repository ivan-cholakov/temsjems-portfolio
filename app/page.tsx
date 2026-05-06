import Link from "next/link";
import { Eyebrow } from "@/components/Eyebrow";
import { HomeCanvas } from "@/components/HomeCanvas";
import { ProjectCard } from "@/components/ProjectCard";
import { SITE, PROJECTS } from "@/content/site";

export default function Home() {
  // JSON-LD: site + artist as the canonical entity for /
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      author: { "@type": "Person", name: SITE.artist },
    },
    {
      "@context": "https://schema.org",
      "@type": "VisualArtist",
      name: SITE.artist,
      alternateName: SITE.name,
      description: SITE.bio,
      url: SITE.url,
      image: new URL(SITE.portrait.src, SITE.url).toString(),
      knowsAbout: ["Linocut", "Watercolor", "Printmaking"],
      ...(SITE.social.instagram
        ? { sameAs: [`https://www.instagram.com/${SITE.social.instagram}`] }
        : {}),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeCanvas />

      {/* ── Selected Work ───────────────────────────────────────────────
      <section className="max-w-[1600px] px-6 pt-16 pb-24 md:px-10 md:pt-24 md:pb-40">
        <div className="mb-16 flex items-baseline justify-between md:mb-24">
          <Eyebrow as="h2">── Selected Work</Eyebrow>
          <Link href="/work" className="eyebrow underline-link">
            Index ↗
          </Link>
        </div>

        <div className="space-y-24 md:space-y-40">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i + 1}
              priority={i === 0}
            />
          ))}
        </div>
      </section> */}

    </>
  );
}
