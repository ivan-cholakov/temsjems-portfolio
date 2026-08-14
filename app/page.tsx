import type { Metadata } from "next";

import { HomeCanvas } from "@/components/HomeCanvas";
import { personSchema, websiteSchema } from "@/lib/structured-data";
import { pagePath } from "@/lib/urls";

// Title and description come from the root layout; the canonical must still
// be declared here - the layout cannot know which route it is rendering.
export const metadata: Metadata = {
  alternates: { canonical: pagePath("/") },
};

export default function Home() {
  const jsonLd = [websiteSchema(), personSchema()];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeCanvas />
    </>
  );
}
