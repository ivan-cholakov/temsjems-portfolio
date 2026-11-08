import Link from "next/link";

import { SERIES, seriesPath, type SeriesSlug } from "@/content/site";

export function SeriesNav({ active }: { active: SeriesSlug | null }) {
  return (
    <nav
      aria-label="Series"
      className="flex flex-wrap items-center gap-x-6 gap-y-3"
    >
      {SERIES.map((series) => {
        const current = series.slug === active;
        return (
          <Link
            key={series.slug}
            href={seriesPath(series.slug)}
            aria-current={current ? "page" : undefined}
            className={`text-h3 tracking-tight underline-link transition-colors ${
              current ? "font-bold text-ink" : "font-medium text-mute hover:text-ink"
            }`}
          >
            {series.title}
          </Link>
        );
      })}
    </nav>
  );
}
