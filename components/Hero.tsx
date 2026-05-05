import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/content/site";

/**
 * Site-wide hero. Sticky at the top of the viewport, transparent
 * background — content scrolls underneath it. Renders on every page.
 *
 * The "About" link is anchored to the top-right corner of the hero on
 * desktop. On mobile it lives in the sidebar's top bar instead.
 */
export function Hero() {
  return (
    <section className="sticky top-0 z-40 max-w-[1600px] px-6 pt-6 pb-12 md:px-10 md:pt-10 md:pb-16">
      <Link
        href="/about"
        className="absolute right-6 top-6 hidden font-display text-h3 font-bold underline-link md:right-10 md:top-10 md:block"
      >
        About
      </Link>

      <h1 className="mt-4 font-display text-display font-bold uppercase leading-[0.95] text-mute">
        <Image
          src="/m-monogram-v3.png"
          alt="M"
          width={2514}
          height={2029}
          priority
          className="inline-block h-[1cap] w-auto align-baseline"
        />{SITE.name.slice(1)}
      </h1>
    </section>
  );
}
