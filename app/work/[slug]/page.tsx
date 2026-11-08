import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtworkViewer, type Shot } from "@/components/ArtworkViewer";
import {
  PROJECTS,
  SITE,
  catalogDetails,
  projectBySlug,
  seriesBySlug,
  seriesPath,
  type Project,
} from "@/content/site";
import { artworkSchema } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  const title = project.title;
  const catalog = catalogDetails(project).map((d) => d.value).join(" | ");
  const description =
    catalog ||
    project.body?.slice(0, 200) ||
    `${project.title} - ${seriesBySlug(project.series).title}, work by ${SITE.artist}.`;
  return {
    title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${title} - ${SITE.name}`,
      description,
      url: `/work/${project.slug}`,
      images: [{ url: project.image, width: project.width, height: project.height, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${SITE.name}`,
      description,
      images: [project.image],
    },
  };
}

function shotsOf(project: Project): { main: Shot; details: Shot[] } {
  return {
    main: {
      src: project.image,
      width: project.width,
      height: project.height,
      alt: `${project.title} - work by ${SITE.artist}`,
      label: null,
      note: null,
    },
    details: (project.extraImages ?? []).map((img, i) => ({
      src: img.src,
      width: img.width,
      height: img.height,
      alt: img.alt ?? `${project.title} - detail ${i + 1}`,
      label: img.label ?? null,
      note: img.note ?? null,
    })),
  };
}

export default async function ProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const series = seriesBySlug(project.series);
  const details = catalogDetails(project);
  const { main, details: detailShots } = shotsOf(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkSchema(project)) }}
      />

      <section className="shell pt-6 pb-24 md:pt-10 md:pb-40">
        {/* From xl the work takes up to 62% of the screen and the text keeps
            the rest, down to a 16rem column; narrower screens stack the two. */}
        <div className="grid grid-cols-1 gap-y-10 xl:grid-cols-[minmax(0,62vw)_minmax(16rem,1fr)] xl:gap-x-12">
          <div>
            <ArtworkViewer main={main} details={detailShots} />
          </div>

          <div className="xl:sticky xl:top-10 xl:self-start">
            <Link
              href={seriesPath(series.slug)}
              className="eyebrow text-label underline-link transition-colors hover:text-ink"
            >
              {series.title}
            </Link>

            <h2 className="mt-5 text-h2 font-bold tracking-tight">{project.title}</h2>

            {details.length > 0 && (
              <dl className="mt-6 space-y-1 text-[1.5rem] leading-snug font-medium text-ink md:text-[1.625rem]">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt className="sr-only">{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {project.body && (
              <p className="mt-6 max-w-[60ch] leading-relaxed">{project.body}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
