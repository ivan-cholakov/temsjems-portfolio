import type { Metadata } from "next";

import { PostCard } from "@/components/PostCard";
import { POSTS_BY_DATE } from "@/content/blog";
import { SITE, OG_IMAGE } from "@/content/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Writing from ${SITE.artist} on the practice — linocut, watercolor, the studio.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog — ${SITE.name}`,
    description: `Writing from ${SITE.artist} on the practice.`,
    url: "/blog",
    type: "website",
    images: [OG_IMAGE],
  },
};

export default function BlogIndex() {
  const posts = POSTS_BY_DATE;

  return (
    <section className="mx-auto max-w-[64rem] px-6 pt-6 pb-24 md:pt-10 md:pb-40">
      <h2 className="text-h1 font-bold tracking-tight">Blog.</h2>

      {posts.length === 0 ? (
        <p className="mt-12 text-mute italic">New posts will appear here.</p>
      ) : (
        <ul className="mt-16 grid grid-cols-1 gap-y-20 md:mt-24 md:gap-y-28">
          {posts.map((post, i) => (
            <li key={post.slug}>
              <PostCard post={post} index={i + 1} priority={i === 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
