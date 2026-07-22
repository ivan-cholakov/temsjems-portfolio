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
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("category"));

  const visible = useMemo(() => {
    if (filter.kind === "all") return projects;
    return projects.filter((p) => p.category === filter.value);
  }, [projects, filter]);

  return (
    <>
      <FilterNav filter={filter} />
      <ProjectGrid projects={visible} />
    </>
  );
}

/**
 * Suspense fallback for WorkGallery. `useSearchParams` above makes the static
 * prerender emit the fallback, so it must render the same layout as the
 * default (unfiltered) view - a `null` fallback ships empty HTML, and the
 * grid popping in at hydration shoves the footer down (CLS ~0.41).
 */
export function WorkGalleryFallback({ projects }: { projects: Project[] }) {
  return (
    <>
      <FilterNav filter={ALL} />
      <ProjectGrid projects={projects} />
    </>
  );
}

function FilterNav({ filter }: { filter: Filter }) {
  const pathname = usePathname();

  const hrefFor = (f: Filter) =>
    f.kind === "all" ? pathname : `${pathname}?category=${f.value}`;

  return (
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
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-mute italic">No works in this category yet.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 md:gap-x-7 md:gap-y-20 lg:grid-cols-3">
      {projects.map((project, i) => {
        return (
          <li key={project.slug}>
            <Link href={`/work/${project.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
                <Image
                  src={project.image}
                  alt={`${project.title} — work by ${SITE.artist}`}
                  fill
                  priority={i < 3}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 3rem)"
                  // object-contain keeps every piece uncropped inside the
                  // uniform 4:5 cell; landscape works letterbox against
                  // bg-paper rather than having their frame edges clipped.
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-2 text-center">
                <h2 className="text-h3 font-bold tracking-tight">
                  <span className="underline-link">{project.title}</span>
                </h2>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
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
