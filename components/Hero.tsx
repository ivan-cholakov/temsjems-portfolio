import Image from "next/image";
import { SITE } from "@/content/site";

/**
 * Site-wide hero. Sticky at the top of the viewport and sitting below the page
 * content in the stack: the logo holds its place while the opaque page slides
 * up over it, so copy is never printed across the letterforms. Renders on
 * every page.
 */
export function Hero() {
  return (
    <section className="shell sticky top-0 z-0 pt-6 pb-12 md:pt-10 md:pb-16">
      <h1 className="mt-4 font-display text-display font-bold uppercase leading-[0.95] text-mute">
        <Image
          src="/m-monogram.webp"
          alt="M"
          width={496}
          height={400}
          priority
          className="inline-block h-[1cap] w-auto align-baseline"
        />{SITE.name.slice(1)}
      </h1>
    </section>
  );
}
