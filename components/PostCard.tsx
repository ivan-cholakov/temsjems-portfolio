import Link from "next/link";
import Image from "next/image";

import { Eyebrow } from "./Eyebrow";
import { cardPreviewText, formatPostDate, readingMinutes, type Post } from "@/content/blog";

/**
 * Brutalist blog row: a compact cover on the left, title + standfirst on the
 * right, numbered like the Work grid. The cover is intentionally modest so the
 * list reads as an index, not a stack of full-bleed images.
 */
export function PostCard({
  post,
  index,
  priority = false,
}: {
  post: Post;
  index: number;
  priority?: boolean;
}) {
  const numLabel = String(index).padStart(2, "0");

  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-12 md:items-center"
      >
        <div className="md:col-span-5">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            priority={priority}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </div>

        <div className="md:col-span-7">
          <Eyebrow as="span" className="text-mute">
            {numLabel}
          </Eyebrow>
          <h3 className="mt-3 text-h2 font-bold tracking-tight">
            <span className="underline-link text-balance">{post.title}</span>
          </h3>
          <p className="mt-4 max-w-[52ch] text-lead leading-tight">
            {cardPreviewText(post)}
          </p>
          <Eyebrow as="p" className="mt-5 text-mute">
            {formatPostDate(post.date)}, {readingMinutes(post)} min read
          </Eyebrow>
        </div>
      </Link>
    </article>
  );
}
