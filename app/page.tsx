import { HomeCanvas } from "@/components/HomeCanvas";
import { visualArtistSchema, websiteSchema } from "@/lib/structured-data";

export default function Home() {
  const jsonLd = [websiteSchema(), visualArtistSchema()];

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
