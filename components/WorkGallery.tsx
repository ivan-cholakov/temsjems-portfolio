"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { CATEGORIES, type Category, type Project } from "@/content/site";
import { SITE } from "@/content/site";

type Filter = { kind: "all" } | { kind: "category"; value: Category };

const ALL: Filter = { kind: "all" };

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.value));

function parseFilter(param: string | null): Filter {
  if (param && VALID_CATEGORIES.has(param)) {
    return { kind: "category", value: param as Category };
  }
  return ALL;
}

function eq(a: Filter, b: Filter): boolean {
  if (a.kind === "all") return b.kind === "all";
  return b.kind === "category" && a.value === b.value;
}

export function WorkGallery({ projects }: { projects: Project[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("category"));

  const visible = useMemo(() => {
    if (filter.kind === "all") return projects;
    return projects.filter((p) => p.category === filter.value);
  }, [projects, filter]);

  const hrefFor = (f: Filter) =>
    f.kind === "all" ? pathname : `${pathname}?category=${f.value}`;

  return (
    <>
      <nav
        aria-label="Filter works by category"
        className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 md:mb-14"
      >
        <FilterLink
          label="All Works"
          href={hrefFor(ALL)}
          active={eq(filter, ALL)}
        />
        {CATEGORIES.map((c) => {
          const f: Filter = { kind: "category", value: c.value };
          return (
            <FilterLink
              key={c.value}
              label={c.label}
              href={hrefFor(f)}
              active={eq(filter, f)}
            />
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <p className="text-mute italic">No works in this category yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 md:gap-x-7 md:gap-y-20 lg:grid-cols-3">
          {visible.map((project, i) => {
            // Landscape pieces letterbox heavily inside the portrait 4:5 cell
            // when contained — scale them up so they fill more of the cell.
            const isLandscape = project.width / project.height > 1.3;
            return (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
                    <Image
                      src={project.image}
                      alt={`${project.title} — work by ${SITE.artist}`}
                      fill
                      priority={i < 3 || project.lcp === true}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className={`object-contain transition-transform duration-700 ease-out ${
                        isLandscape
                          ? "scale-[1.4] group-hover:scale-[1.43]"
                          : "group-hover:scale-[1.02]"
                      }`}
                    />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-h3 font-bold tracking-tight">
                      <span className="underline-link">{project.title}</span>
                    </h2>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      replace
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`text-h3 tracking-tight underline-link transition-colors ${
        active ? "font-bold text-ink" : "font-medium text-mute"
      }`}
    >
      {label}
    </Link>
  );
}
