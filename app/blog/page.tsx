import type { Metadata } from "next";

import { Eyebrow } from "@/components/Eyebrow";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Notes from the studio of ${SITE.artist} — writing on linocut, watercolor, and the practice.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog — ${SITE.name}`,
    description: `Notes from the studio of ${SITE.artist}.`,
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  return (
    <section className="max-w-[1600px] px-6 pt-6 pb-24 md:px-10 md:pt-10 md:pb-40">
      <Eyebrow as="p" className="text-mute">── Notes from the studio</Eyebrow>
      <h2 className="mt-6 text-h1 font-bold tracking-tight">Blog.</h2>

      <div className="mt-16 max-w-[60ch]">
        <Eyebrow as="p" className="text-mute">── First post forthcoming</Eyebrow>
        <p className="mt-6 text-lead leading-tight">
          Writing on the practice — linocut, watercolor, the studio.
          New posts will appear here.
        </p>
      </div>
    </section>
  );
}
