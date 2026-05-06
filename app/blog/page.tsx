import type { Metadata } from "next";

import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Writing from ${SITE.artist} on the practice — linocut, watercolor, the studio.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog — ${SITE.name}`,
    description: `Writing from ${SITE.artist} on the practice.`,
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  return (
    <section className="max-w-[1600px] px-6 pt-6 pb-24 md:px-10 md:pt-10 md:pb-40">
      <h2 className="text-h1 font-bold tracking-tight">Blog.</h2>

      <p className="mt-12 max-w-[60ch] text-lead leading-tight">
        Writing on the practice — linocut, watercolor, the studio.
        New posts will appear here.
      </p>
    </section>
  );
}
