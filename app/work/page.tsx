import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { Eyebrow } from "@/components/Eyebrow";
import { PROJECTS, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: `Selected works by ${SITE.artist} — linocut and watercolor explorations of transformation and identity.`,
  alternates: { canonical: "/work" },
  openGraph: {
    title: `Work — ${SITE.name}`,
    description: `Selected works by ${SITE.artist}.`,
    type: "website",
    url: "/work",
  },
};

export default function WorkIndex() {
  return (
    <>
      <section className="mx-auto max-w-[1600px] px-6 pt-12 pb-24 md:px-10 md:pt-16 md:pb-40">
        <ul className="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 md:gap-x-7 md:gap-y-20 lg:grid-cols-3">
          {PROJECTS.map((project, i) => {
            // Landscape pieces letterbox heavily inside the portrait 4:5 cell
            // when contained — scale them up so they fill more of the cell.
            // The parent's overflow-hidden clips the modest side bleed.
            const isLandscape = project.width / project.height > 1.3;
            return (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
                  <Image
                    src={project.image}
                    alt={`${project.title} — work by ${SITE.artist}`}
                    fill
                    priority={i < 3}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-contain transition-transform duration-700 ease-out ${
                      isLandscape
                        ? "scale-[1.4] group-hover:scale-[1.43]"
                        : "group-hover:scale-[1.02]"
                    }`}
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="text-h3 font-bold tracking-tight">
                    <span className="underline-link">{project.title}</span>
                  </h2>
                  <Eyebrow className="text-mute">
                    {String(i + 1).padStart(2, "0")}
                  </Eyebrow>
                </div>
              </Link>
            </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
