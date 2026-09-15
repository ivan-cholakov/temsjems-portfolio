import { HomeCanvas } from "@/components/HomeCanvas";
import { personSchema, websiteSchema } from "@/lib/structured-data";

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
