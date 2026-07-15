import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Eyebrow } from "@/components/Eyebrow";
import { PostBody } from "@/components/PostBody";
import { POSTS, postBySlug, formatPostDate, readingMinutes } from "@/content/blog";
import { SITE } from "@/content/site";
import { blogPostingSchema } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} — ${SITE.name}`,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: post.cover.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — ${SITE.name}`,
      description: post.excerpt,
      images: [post.cover.src],
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema(post)) }}
      />

      <article className="mx-auto max-w-[50rem] px-6 pt-6 pb-24 md:pt-10 md:pb-40">
        <header>
          <Eyebrow as="p" className="text-mute">
            {formatPostDate(post.date)}, {readingMinutes(post)} min read
          </Eyebrow>
          <h1 className="mt-6 text-h1 font-bold tracking-tight text-balance">
            {post.title}
          </h1>
          {!post.hideExcerpt && (
            <p className="mt-8 text-lead leading-tight">{post.excerpt}</p>
          )}
        </header>

        <PostBody blocks={post.body} />
      </article>
    </>
  );
}
