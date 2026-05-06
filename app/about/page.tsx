import type { Metadata } from "next";
import Image from "next/image";

import { Eyebrow } from "@/components/Eyebrow";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: SITE.bio.slice(0, 200),
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${SITE.name}`,
    description: SITE.bio.slice(0, 200),
    url: "/about",
    type: "profile",
  },
};

export default function AboutPage() {
  // JSON-LD: artist profile.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.artist,
    alternateName: SITE.name,
    description: SITE.bio,
    url: SITE.url,
    image: new URL(SITE.portrait.src, SITE.url).toString(),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Sofia University \"St. Kliment Ohridski\"",
    },
    knowsAbout: ["Linocut", "Watercolor", "Printmaking", "Visual narrative"],
    jobTitle: "Visual artist",
    ...(SITE.social.instagram
      ? { sameAs: [`https://www.instagram.com/${SITE.social.instagram}`] }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Title slab ───────────────────────────────────────────────── */}
      <section className="max-w-[1600px] px-6 pt-6 pb-16 md:px-10 md:pt-10 md:pb-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-9">
            <Eyebrow as="p" className="text-mute">── About</Eyebrow>
            <h2 className="mt-6 text-h1 font-bold tracking-tight">
              {SITE.artist}
            </h2>
          </div>
        </div>
      </section>

      {/* ── Bio + portrait ───────────────────────────────────────────── */}
      <section className="max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-7">
            <Eyebrow as="h2" className="text-mute">── Practice</Eyebrow>
            <p className="mt-6 max-w-[58ch] text-lead leading-relaxed">
              {SITE.bio}
            </p>
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-8">
            <Image
              src={SITE.portrait.src}
              alt={`Portrait of ${SITE.artist}`}
              width={SITE.portrait.width}
              height={SITE.portrait.height}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>

    </>
  );
}
