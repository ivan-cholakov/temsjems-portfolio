import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { DetailGallery } from "@/components/DetailGallery";
import { PROJECTS, projectBySlug, taglineOf, SITE } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
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
  const description =
    taglineOf(project) ??
    project.body?.slice(0, 200) ??
    `${project.title} — work by ${SITE.artist}.`;
  return {
    ...pageMetadata({
      title,
      description,
      path: `/work/${project.slug}`,
      og: {
        type: "article",
        images: [{ url: project.image, width: project.width, height: project.height, alt: title }],
      },
    }),
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
  const tagline = taglineOf(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkSchema(project)) }}
      />

      <section className="max-w-[1600px] px-6 pt-6 pb-24 md:px-10 md:pt-10 md:pb-40">
        {/* Two-column body: art piece left, title + description right */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12 md:gap-x-12 lg:gap-x-20">
          <div className="md:col-span-7">
            <Image
              src={project.image}
              alt={`${project.title} — work by ${SITE.artist}`}
              width={project.width}
              height={project.height}
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 58vw, 100vw"
              className="block h-auto w-full"
            />
            {project.extraImages && project.extraImages.length > 0 && (
              <DetailGallery
                images={project.extraImages}
                projectTitle={project.title}
              />
            )}
          </div>

          <div className="md:col-span-5">
            <h2 className="text-h1 font-bold tracking-tight">
              {project.title}
            </h2>

            {tagline && (
              <p className="mt-8 text-balance text-lead leading-tight">
                {tagline}
              </p>
            )}

            {project.body && (
              <p className={`max-w-[60ch] leading-relaxed ${tagline ? "mt-6" : "mt-8"}`}>
                {project.body}
              </p>
            )}
          </div>
        </div>

      </section>
    </>
  );
}
