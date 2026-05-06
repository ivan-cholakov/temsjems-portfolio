import Link from "next/link";
import Image from "next/image";
import { Eyebrow } from "./Eyebrow";
import { mediumOf, SITE, type Project } from "@/content/site";

/**
 * Brutalist project row: numbered index, large title, oversized image.
 * Variant `compact` is used in dense listings; default is full-bleed.
 */
export function ProjectCard({
  project,
  index,
  variant = "default",
  priority = false,
}: {
  project: Project;
  index: number;
  variant?: "default" | "compact";
  priority?: boolean;
}) {
  const numLabel = String(index).padStart(2, "0");

  return (
    <article className="group">
      <Link href={`/work/${project.slug}`} className="block">
        <header className="grid grid-cols-12 items-baseline gap-4 pb-6 md:gap-6">
          <Eyebrow as="span" className="col-span-2 text-mute md:col-span-1">
            {numLabel}
          </Eyebrow>
          <h3 className="col-span-10 text-h2 font-bold tracking-tight md:col-span-9">
            <span className="underline-link">{project.title}</span>
          </h3>
          <Eyebrow as="span" className="col-span-12 text-mute md:col-span-2 md:text-right">
            {mediumOf(project)}
          </Eyebrow>
        </header>

        <div
          className={
            variant === "compact"
              ? "relative aspect-[4/5] w-full overflow-hidden"
              : "relative w-full overflow-hidden"
          }
        >
          <Image
            src={project.image}
            alt={`${project.title} — work by ${SITE.artist}`}
            width={project.width}
            height={project.height}
            priority={priority || project.lcp === true}
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>
      </Link>
    </article>
  );
}
