import Link from "next/link";

import { SERIES, seriesPath, type SeriesSlug } from "@/content/site";

/** `null` is the Work index, where every series is listed: the "All" entry. */
export function SeriesNav({ active }: { active: SeriesSlug | null }) {
  return (
    <nav
      aria-label="Series"
      className="flex flex-wrap items-center gap-x-6 gap-y-3"
    >
      <NavLink href="/work" current={active === null}>
        All
      </NavLink>
      {SERIES.map((series) => (
        <NavLink
          key={series.slug}
          href={seriesPath(series.slug)}
          current={series.slug === active}
        >
          {series.title}
        </NavLink>
      ))}
    </nav>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`text-h3 tracking-tight underline-link transition-colors ${
        current ? "font-bold text-ink" : "font-medium text-mute hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
