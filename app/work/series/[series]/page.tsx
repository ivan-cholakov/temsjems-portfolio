import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeriesNav } from "@/components/SeriesNav";
import { SeriesSection } from "@/components/SeriesSection";
import {
  OG_IMAGE,
  SERIES,
  SITE,
  projectsInSeries,
  seriesPath,
  type Series,
} from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERIES.map((s) => ({ series: s.slug }));
}

/** Tiles in the widest grid row, and so the works above the fold. */
const FIRST_ROW = 4;

function parseSeries(param: string): Series | undefined {
  return SERIES.find((s) => s.slug === param);
}

export async function generateMetadata(
  { params }: { params: Promise<{ series: string }> },
): Promise<Metadata> {
  const series = parseSeries((await params).series);
  if (!series) return {};
  const titles = projectsInSeries(series.slug).map((p) => p.title).join(", ");
  const description = series.intro ?? `${series.title}: ${titles}. Works by ${SITE.artist}.`;
  const path = seriesPath(series.slug);
  return {
    title: series.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${series.title} - ${SITE.name}`,
      description,
      url: path,
      type: "website",
      images: [OG_IMAGE],
    },
  };
}

export default async function SeriesPage(
  { params }: { params: Promise<{ series: string }> },
) {
  const series = parseSeries((await params).series);
  if (!series) notFound();

  return (
    <div className="shell pt-12 pb-24 md:pt-16 md:pb-40">
      <SeriesNav active={series.slug} />
      <div className="mt-14 md:mt-20">
        <SeriesSection
          series={series}
          works={projectsInSeries(series.slug)}
          heading="plain"
          eager={FIRST_ROW}
        />
      </div>
    </div>
  );
}
