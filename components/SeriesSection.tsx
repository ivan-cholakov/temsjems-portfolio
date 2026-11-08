import Image from "next/image";
import Link from "next/link";

import { SITE, seriesPath, type Project, type Series } from "@/content/site";

/**
 * A series heading, its short text, and its works as a grid of equal 4:5
 * tiles. Works are photographed at 4:5, so every image fills its tile and a
 * row of them shares one height; a piece not yet reshot at 4:5 is fitted
 * whole inside the tile rather than cropped.
 */
export function SeriesSection({
  series,
  works,
  heading,
  eager,
}: {
  series: Series;
  works: Project[];
  /** `link` points the heading at the series page, for listings of several series. */
  heading: "link" | "plain";
  /** How many leading tiles load eagerly - the first row when the section opens the page. */
  eager: number;
}) {
  const headingId = `series-${series.slug}`;
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-h2 font-bold tracking-tight">
        {heading === "link" ? (
          <Link href={seriesPath(series.slug)} className="underline-text">
            {series.title}
          </Link>
        ) : (
          series.title
        )}
      </h2>

      {series.intro && (
        <p className="mt-6 max-w-measure text-prose leading-relaxed">{series.intro}</p>
      )}

      <ul className="mt-10 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 md:mt-12 md:gap-x-7 md:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
        {works.map((work, i) => (
          <li key={work.slug}>
            <Link href={`/work/${work.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={work.image}
                  alt={`${work.title} - work by ${SITE.artist}`}
                  fill
                  priority={i < eager}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <h3 className="mt-3 text-center text-h3 font-bold tracking-tight">
                <span className="underline-text">{work.title}</span>
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
