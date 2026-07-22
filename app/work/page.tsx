import { Suspense } from "react";
import type { Metadata } from "next";

import { WorkGallery, WorkGalleryFallback } from "@/components/WorkGallery";
import { PROJECTS, SITE } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: `Selected works by ${SITE.artist} — gel plate monoprints, linocut collages, and ink works.`,
  path: "/work",
  og: { type: "website", description: `Selected works by ${SITE.artist}.` },
});

export default function WorkIndex() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 pt-12 pb-24 md:px-10 md:pt-16 md:pb-40">
      {/* The fallback IS the prerendered HTML (useSearchParams forces it):
          it must match the default view's layout or the page shifts. */}
      <Suspense fallback={<WorkGalleryFallback projects={PROJECTS} />}>
        <WorkGallery projects={PROJECTS} />
      </Suspense>
    </section>
  );
}
