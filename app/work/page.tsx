import type { Metadata } from "next";

import { SeriesNav } from "@/components/SeriesNav";
import { SeriesSection } from "@/components/SeriesSection";
import { SERIES, SITE, OG_IMAGE, projectsInSeries } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: `Selected works by ${SITE.artist} - linocuts on cloth, ex libris and works on paper.`,
  alternates: { canonical: "/work" },
  openGraph: {
    title: `Work - ${SITE.name}`,
    description: `Selected works by ${SITE.artist}.`,
    type: "website",
    url: "/work",
    images: [OG_IMAGE],
  },
};

/** Tiles in the widest grid row, and so the works above the fold. */
const FIRST_ROW = 4;

export default function WorkIndex() {
  return (
    <div className="shell pt-12 pb-24 md:pt-16 md:pb-40">
      <SeriesNav active={null} />
      <div className="mt-14 space-y-24 md:mt-20 md:space-y-32">
        {SERIES.map((series, i) => (
          <SeriesSection
            key={series.slug}
            series={series}
            works={projectsInSeries(series.slug)}
            heading="link"
            eager={i === 0 ? FIRST_ROW : 0}
          />
        ))}
      </div>
    </div>
  );
}
