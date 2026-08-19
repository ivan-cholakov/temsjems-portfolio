import type { Metadata } from "next";
import Image from "next/image";

import { Eyebrow } from "@/components/Eyebrow";
import { CV, SITE, OG_IMAGE } from "@/content/site";
import { personSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About",
  description: SITE.bio.slice(0, 200),
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${SITE.name}`,
    description: SITE.bio.slice(0, 200),
    url: "/about",
    type: "profile",
    images: [OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
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
            <Eyebrow as="h2" className="text-mute">── Artist statement</Eyebrow>
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

      {/* ── Curriculum vitae ─────────────────────────────────────────── */}
      <section className="max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-7">
            <Eyebrow as="h2" className="text-mute">── Curriculum vitae</Eyebrow>

            {/* Wider measure than the statement above: CV lines are a list, not
                prose, and read best when an entry survives on one line. */}
            <div className="mt-6 max-w-[82ch] leading-relaxed">
              <p className="text-lead">{SITE.artist}</p>
              <p className="mt-2">{CV.born}</p>
              <p>{CV.based}</p>
            </div>

            {CV.sections.map((section) => (
              <div key={section.heading} className="mt-12 max-w-[82ch]">
                <Eyebrow as="h3" className="text-mute">{section.heading}</Eyebrow>
                <ul className="mt-5 space-y-3 leading-relaxed">
                  {section.entries.map((entry) => (
                    <li key={`${entry.year} ${entry.work?.title ?? entry.venue}`}>
                      {entry.year}
                      {section.yearSeparator}{" "}
                      {entry.work && (
                        <>
                          {entry.work.lead && `${entry.work.lead} `}
                          <em>{entry.work.title}</em>,{" "}
                        </>
                      )}
                      {entry.venue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
