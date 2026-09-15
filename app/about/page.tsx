import type { Metadata } from "next";
import Image from "next/image";

import { Eyebrow } from "@/components/Eyebrow";
import { Prose, WorkTitle } from "@/components/Prose";
import { CV, SITE, OG_IMAGE } from "@/content/site";
import { personSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About",
  description: SITE.metaDescription,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About - ${SITE.name}`,
    description: SITE.metaDescription,
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
        {/* ── Title slab ───────────────────────────────────────────────── */}
        <section className="shell mx-auto pt-6 pb-16 md:pt-10 md:pb-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-9">
              <Eyebrow as="p" size="section">About</Eyebrow>
              <h2 className="mt-6 text-h1 font-bold tracking-tight">
                {SITE.artist}
              </h2>
            </div>
          </div>
        </section>

        {/* ── Statement + portrait + bio + CV ──────────────────────────────
             Wide screens are one block flow with the portrait floated right,
             not a two-column grid: the statement sits beside the photo, and the
             CV wraps past its bottom edge to reclaim the full width instead of
             running down a narrow column beside empty paper. Below xl the menu
             and gutter leave too little room to set two columns, so the column
             stacks, and grid row placement holds the reading order (statement,
             portrait, bio, CV) that the source order alone would lose. */}
        <section className="shell mx-auto py-16 md:py-24">
          <div className="grid grid-cols-1 gap-y-12 xl:flow-root">
            {/* `sizes` is derived from the widths beside it, not guessed, and has
                to be re-derived if either changes. At xl the photo is 44% of a
                column that the rail and gutter have already taken roughly a
                quarter of the viewport from, so 0.44 x ~0.77vw rounds to 34vw.
                Between md and xl it is the stacked column capped at 720px, and
                below md it is the full viewport. Over-declaring here costs a
                needlessly large download on every phone. */}
            <div className="row-start-2 max-w-[720px] xl:float-right xl:mb-10 xl:ml-12 xl:w-[44%]">
              <Image
                src={SITE.portrait.src}
                alt={`Portrait of ${SITE.artist}`}
                width={SITE.portrait.width}
                height={SITE.portrait.height}
                sizes="(min-width: 1280px) 34vw, (min-width: 768px) 720px, 100vw"
                className="block h-auto w-full"
              />
            </div>

            {/* Its own block formatting context, so the statement stays beside
                the photo at a fixed measure rather than half its lines wrapping
                short and the rest running under it. */}
            <div className="row-start-1 xl:flow-root">
              <Eyebrow as="h2" size="section">Artist statement</Eyebrow>
              <div className="mt-8 max-w-measure space-y-6 text-prose leading-relaxed">
                {/* Keyed by the text itself: the statement is fixed copy with no
                    two paragraphs alike, so the paragraph is its own identity. */}
                {SITE.statement.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Same block formatting context as the statement: on a tall
                portrait the float can still be running when the bio starts, and
                a clean narrow column reads better than three short lines
                followed by full-width ones. */}
            <div className="row-start-3 xl:mt-16 xl:flow-root">
              <Eyebrow as="h2" size="section">Bio</Eyebrow>
              <p className="mt-8 max-w-measure text-prose leading-relaxed">
                <Prose runs={SITE.bio} />
              </p>
            </div>

            <div className="row-start-4 xl:mt-16">
              <Eyebrow as="h2" size="section">Curriculum vitae</Eyebrow>

              {/* Set at the statement's size, not body size: the CV is primary
                  page copy, and a list of proper nouns is unforgiving to read
                  small. No measure cap, unlike the statement: these are list
                  entries, which read best unwrapped. */}
              <div className="mt-8 space-y-12">
                {CV.map((section) => (
                  <div key={section.heading}>
                    <Eyebrow as="h3" size="label">{section.heading}</Eyebrow>
                    <ul className="mt-5 space-y-3 text-prose leading-relaxed">
                      {section.entries.map((entry) => (
                        <li key={`${entry.year} ${entry.work?.title ?? entry.venue}`}>
                          {entry.year}
                          {section.yearSeparator}{" "}
                          {entry.work && (
                            <>
                              {entry.work.lead && `${entry.work.lead} `}
                              <WorkTitle>{entry.work.title}</WorkTitle>,{" "}
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
          </div>
        </section>
      </div>
    </>
  );
}
