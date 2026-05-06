import type { Metadata } from "next";

import { WorkGallery } from "@/components/WorkGallery";
import { PROJECTS, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: `Selected works by ${SITE.artist} — gel plate monoprints, linocut collages, and ink works.`,
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
    <section className="mx-auto max-w-[1600px] px-6 pt-12 pb-24 md:px-10 md:pt-16 md:pb-40">
      <WorkGallery projects={PROJECTS} />
    </section>
  );
}
