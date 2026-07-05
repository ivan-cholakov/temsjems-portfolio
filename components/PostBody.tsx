import Image from "next/image";

import { Eyebrow } from "./Eyebrow";
import type { PostBlock } from "@/content/blog";

/**
 * Renders a post body — an ordered list of typed blocks — into semantic
 * HTML. The discriminated union means the switch is exhaustive: adding a
 * new block kind is a compile error until it is handled here.
 */
export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="mt-12 md:mt-16">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: PostBlock }) {
  switch (block.kind) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-14 mb-4 text-h2 font-bold tracking-tight md:mt-20">
          {block.text}
        </h2>
      ) : (
        <h3 className="mt-10 mb-3 text-h3 font-bold tracking-tight md:mt-12">
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="mt-5 text-lead leading-relaxed">
          {block.text}
        </p>
      );

    case "tip":
      return (
        <aside className="mt-8 border-l-2 border-mute pl-5 py-1">
          <Eyebrow as="p" className="text-mute">Studio tip</Eyebrow>
          <p className="mt-3 text-lead leading-relaxed">{block.text}</p>
        </aside>
      );

    case "image":
      return (
        <figure className="mt-12 md:mt-16">
          <Image
            src={block.image.src}
            alt={block.image.alt}
            width={block.image.width}
            height={block.image.height}
            sizes="(min-width: 768px) 72vw, 100vw"
            className="block h-auto w-full"
          />
          {block.image.caption && (
            <Eyebrow as="figcaption" className="mt-3 block text-mute normal-case tracking-normal">
              {block.image.caption}
            </Eyebrow>
          )}
        </figure>
      );

    case "outbound":
      return (
        <p className="mt-5 text-lead leading-relaxed">
          {block.before}{" "}
          <a
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-link font-medium text-mute"
          >
            {block.linkLabel}
          </a>
          {block.after}
        </p>
      );
  }
}
