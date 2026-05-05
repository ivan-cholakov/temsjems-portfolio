import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { Eyebrow } from "@/components/Eyebrow";
import { PROJECTS, projectBySlug, SITE } from "@/content/site";

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
  const description =
    project.tagline ??
    project.body?.slice(0, 200) ??
    `${project.title} — work by ${SITE.artist}.`;
  return {
    title,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description,
      url: `/work/${project.slug}`,
      images: [{ url: project.image, width: project.width, height: project.height, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE.name}`,
      description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);

  // JSON-LD: each project page describes a VisualArtwork created by the artist.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: project.title,
    creator: { "@type": "Person", name: SITE.artist },
    artform: "Linocut and watercolor",
    artMedium: project.medium ?? "Linocut, watercolor",
    image: new URL(project.image, SITE.url).toString(),
    url: new URL(`/work/${project.slug}`, SITE.url).toString(),
    ...(project.body ? { description: project.body } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="max-w-[1600px] px-6 pt-6 pb-24 md:px-10 md:pt-10 md:pb-40">
        {/* Title slab — full width above the two-column body */}
        <Eyebrow as="p" className="text-mute">
          ── No. {String(idx + 1).padStart(2, "0")} / Selected Work
        </Eyebrow>
        <h2 className="mt-6 text-h1 font-bold tracking-tight">
          {project.title}
        </h2>

        {/* Two-column body: art piece left, description right */}
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 md:mt-16 md:grid-cols-12 md:gap-x-12 lg:gap-x-20">
          <div className="md:col-span-7">
            <Image
              src={project.image}
              alt={`${project.title} — work by ${SITE.artist}`}
              width={project.width}
              height={project.height}
              priority
              sizes="(min-width: 768px) 58vw, 100vw"
              className="block h-auto w-full"
            />
          </div>

          <div className="md:col-span-5">
            {project.tagline && (
              <p className="text-balance text-lead leading-tight">
                {project.tagline}
              </p>
            )}

            {project.body ? (
              <p className={`max-w-[60ch] leading-relaxed ${project.tagline ? "mt-8" : ""}`}>
                {project.body}
              </p>
            ) : (
              <Eyebrow as="p" className={`text-mute ${project.tagline ? "mt-8" : ""}`}>
                ── Description forthcoming
              </Eyebrow>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
