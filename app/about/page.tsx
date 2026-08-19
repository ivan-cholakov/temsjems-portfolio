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

      {/* Answers the `md:pl-rail` the layout puts on page content, so a wide
          screen frames this page between two equal margins: the menu on the
          left, the same width of paper on the right. */}
      <div className="md:pr-gutter">
        {/* ── Title slab ───────────────────────────────────────────────
             Deep top padding on desktop: the hero logo is sticky and
             transparent, so the page heading needs clearance under it. */}
        <section className="shell mx-auto pt-6 pb-16 md:pt-28 md:pb-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-9">
              <Eyebrow as="p" size="section">About</Eyebrow>
              <h2 className="mt-6 text-h1 font-bold tracking-tight">
                {SITE.artist}
              </h2>
            </div>
          </div>
        </section>

        {/* ── Statement + portrait + CV ────────────────────────────────
             Wide screens are one block flow with the portrait floated right,
             not a two-column grid: the statement sits beside the photo, and the
             CV wraps past its bottom edge to reclaim the full width instead of
             running down a narrow column beside empty paper. Below xl the menu
             and gutter leave too little room to set two columns, so the column
             stacks, and grid row placement holds the reading order (statement,
             portrait, CV) that the source order alone would lose. */}
        <section className="shell mx-auto py-16 md:py-24">
          <div className="grid grid-cols-1 gap-y-12 xl:flow-root">
            <div className="row-start-2 max-w-[560px] xl:float-right xl:mb-10 xl:ml-12 xl:w-[38%]">
              <Image
                src={SITE.portrait.src}
                alt={`Portrait of ${SITE.artist}`}
                width={SITE.portrait.width}
                height={SITE.portrait.height}
                sizes="(min-width: 1280px) 30vw, (min-width: 768px) 560px, 100vw"
                className="block h-auto w-full"
              />
            </div>

            {/* Its own block formatting context, so the statement stays beside
                the photo at a fixed measure rather than half its lines wrapping
                short and the rest running under it. */}
            <div className="row-start-1 xl:flow-root">
              <Eyebrow as="h2" size="section">Artist statement</Eyebrow>
              <p className="mt-8 max-w-[58ch] text-prose leading-relaxed">
                {SITE.bio}
              </p>
            </div>

            <div className="row-start-3 xl:mt-16">
              <Eyebrow as="h2" size="section">Curriculum vitae</Eyebrow>

              {/* Set at the statement's size, not body size: the CV is primary
                  page copy, and a list of proper nouns is unforgiving to read
                  small. No measure cap, unlike the statement: these are list
                  entries, which read best unwrapped. */}
              <div className="mt-8 text-prose leading-relaxed">
                <p>{SITE.artist}</p>
                <p className="mt-2">{CV.born}</p>
                <p>{CV.based}</p>
              </div>

              {CV.sections.map((section) => (
                <div key={section.heading} className="mt-12">
                  <Eyebrow as="h3" size="label">{section.heading}</Eyebrow>
                  <ul className="mt-5 space-y-3 text-prose leading-relaxed">
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
      </div>
    </>
  );
}
