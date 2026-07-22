import Image from "next/image";
import { SITE } from "@/content/site";

/**
 * Site-wide hero. Sticky at the top of the viewport, transparent
 * background — content scrolls underneath it. Renders on every page.
 * The monogram image stands in for the leading letter of the name; a
 * build-time check in content/site.ts keeps the two aligned.
 */
export function Hero() {
  return (
    <section className="sticky top-0 z-40 max-w-[1600px] px-6 pt-6 pb-12 md:px-10 md:pt-10 md:pb-16">
      <h1 className="mt-4 font-display text-display font-bold uppercase leading-[0.95] text-mute">
        <Image
          src={SITE.monogram.src}
          alt={SITE.monogram.letter}
          // Rendered at 1cap of the display type (~70-140px wide), far below
          // the file's intrinsic 496px - requesting the display size keeps the
          // srcset at the small variant tiers. Deliberately NOT fetchpriority
          // high: the LCP on text pages is the wordmark text waiting on its
          // font, and boosting the monogram would starve that font request.
          width={192}
          height={155}
          priority
          className="inline-block h-[1cap] w-auto align-baseline"
        />{SITE.name.slice(SITE.monogram.letter.length)}
      </h1>
    </section>
  );
}
