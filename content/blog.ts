import { SITE } from "@/content/site";

/** An image inside a post — hero cover or an inline figure. */
export type PostImage = {
  /** Path under /public. */
  src: string;
  /** Intrinsic dimensions (for next/image, which requires them). */
  width: number;
  height: number;
  /** Screen-reader description. */
  alt: string;
  /** Optional visible caption rendered under the figure. */
  caption?: string;
};

/**
 * A post body is an ordered list of blocks rather than a Markdown blob.
 * Modelling the body as a discriminated union keeps every representable
 * body valid (no half-parsed Markdown), lets the renderer emit correct
 * semantic HTML (h2/h3, figure/figcaption) for SEO, and makes invalid
 * combinations — e.g. an image with no source — unrepresentable.
 */
export type PostBlock =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  /** Highlighted studio tip — the 💡 asides in the source article. */
  | { kind: "tip"; text: string }
  | { kind: "image"; image: PostImage }
  /** Closing call-to-action with one outbound link (label sits inside text via {link}). */
  | { kind: "outbound"; before: string; linkLabel: string; href: string; after: string };

export type Post = {
  slug: string;
  title: string;
  /** Standfirst / meta description — one sentence, no trailing period needed. */
  excerpt: string;
  /** ISO date (YYYY-MM-DD) the post was published. */
  date: string;
  /** Author name — defaults to the site artist but kept explicit per post. */
  author: string;
  cover: PostImage;
  body: PostBlock[];
};

const AVG_WORDS_PER_MINUTE = 220;

/** All text a reader actually reads, for word-count / reading-time derivation. */
function postText(post: Post): string {
  return post.body
    .map((b) => {
      switch (b.kind) {
        case "heading":
        case "paragraph":
        case "tip":
          return b.text;
        case "outbound":
          return `${b.before} ${b.linkLabel} ${b.after}`;
        case "image":
          return b.image.caption ?? "";
      }
    })
    .join(" ");
}

/** Reading time, derived from the body — never stored, so it can't drift. */
export function readingMinutes(post: Post): number {
  const words = postText(post).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / AVG_WORDS_PER_MINUTE));
}

/** Long-form date, e.g. "5 July 2026", for display. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const GEL_PLATE_DIR = "/blog/best-plants-for-gel-plate-printing";

export const POSTS: Post[] = [
  {
    slug: "best-plants-for-gel-plate-printing",
    title: "The Best Plants, Leaves and Flowers for Gel Plate Printing",
    excerpt:
      "Which botanicals give the crispest, most detailed gel plate prints - the rules of flatness and texture, and the leaves and flowers I reach for again and again in my workshops.",
    date: "2026-07-05",
    author: SITE.artist,
    cover: {
      src: `${GEL_PLATE_DIR}/cover.webp`,
      width: 985,
      height: 1234,
      alt: "An open art journal printed in teal and green on a black studio table, surrounded by ferns, sunflowers, dried grasses and tubes of acrylic paint.",
    },
    body: [
      {
        kind: "paragraph",
        text: "Working with a gel plate is one of the most therapeutic, experimental, and rewarding activities in contemporary applied arts. This unique material allows us to place anything with texture onto it, such as lace, cardboard, plants, and even print pages from magazines. The plate opens up endless possibilities for combining countless textures and colors.",
      },
      {
        kind: "paragraph",
        text: "The magic of this technique is that you never know exactly what the final result will be. And when you bring real elements of nature into the mix, things become truly magical. Using natural botanical materials allows us to capture the delicate textures of leaves, veins, and flower silhouettes in an inimitable way.",
      },
      {
        kind: "image",
        image: {
          src: `${GEL_PLATE_DIR}/01-botanical-textures.webp`,
          width: 1692,
          height: 909,
          alt: "Three framed gel plate monoprints in green, violet and red laid on a studio table beside fresh flowers, clear gel plates and inked brayers.",
        },
      },
      {
        kind: "paragraph",
        text: "As an art teacher with years of experience teaching and running workshops, today I will share my observations both from my personal experience and from my practice with my students. In my workshops, I often see the challenges and experiments people go through until they truly understand the unique character of different plants.",
      },
      {
        kind: "paragraph",
        text: "The good news is that you can get a print out of almost any plant on a gel plate, whether it's just the basic shape or a highly detailed print. In this article, I will introduce you to the best plants and flowers for printing and share a few professional tricks to achieve crisp, detailed, and high-contrast botanical prints every single time.",
      },
      { kind: "heading", level: 2, text: "The Golden Rules of Choosing Plants for Your Gel Plate" },
      {
        kind: "paragraph",
        text: "Before you head out on a leaf hunt in the park or garden, remember these three important rules, tested in dozens of my classes:",
      },
      { kind: "heading", level: 3, text: "Flatness is Everything" },
      {
        kind: "paragraph",
        text: "Plants that are naturally flat, soft, and flexible always yield the best results. Rigid and woody parts create \"air pockets\" that prevent the paper from adhering tightly to the plate around their edges. That is why, for example, cherry tree twigs or rosemary branches with thick stems are not suitable if you are looking for perfect detail.",
      },
      { kind: "heading", level: 3, text: "Avoid Thorns and Sharp Textures" },
      {
        kind: "paragraph",
        text: "We shouldn't forget that this is a gel plate, which can be damaged, and once torn, it cannot be repaired. Thorny stems or sharp, stiff twigs can easily scratch or puncture it. However, don't worry too much because the plate isn't that fragile either!",
      },
      {
        kind: "tip",
        text: "Some of my absolute favorite prints come from rose leaves. They have an amazing texture! The trick here is simply to gently clean the small thorns off the stem and act boldly.",
      },
      {
        kind: "image",
        image: {
          src: `${GEL_PLATE_DIR}/02-rose-leaves.webp`,
          width: 1412,
          height: 909,
          alt: "Left: a hand holding a deep red rose above a pink monoprint in progress. Right: a crisp red gel plate print of a rose-leaf spray over lace texture.",
        },
      },
      { kind: "heading", level: 3, text: "Texture and Paint Quantity" },
      {
        kind: "paragraph",
        text: "Look for leaves with deep, prominent veins on their underside. The rougher and more textured the back of the leaf is, the more impressive your prints will be. If you really want to get a print from finer and smoother leaves, the amount of paint on the plate should be minimal.",
      },
      { kind: "heading", level: 2, text: "The Best Plants for Botanical Monoprinting" },
      { kind: "heading", level: 3, text: "Take a Walk in the Nearby Park" },
      {
        kind: "paragraph",
        text: "There will be very few leaves that won't work for your print during a walk in the park. Sycamore, maple, and ivy leaves offer classic, graphic shapes that look great as a focal point in collages or standalone paintings. Their thick and prominent veins trap the paint beautifully.",
      },
      {
        kind: "paragraph",
        text: "If you want to experiment with layers, grape leaves or chestnut leaves are perfect! They serve as a wonderful large stencil shape. You can print them as a base, and inside their empty negative space, you can add something else, like a magazine transfer or a stencil pattern.",
      },
      {
        kind: "image",
        image: {
          src: `${GEL_PLATE_DIR}/03-park-leaves.webp`,
          width: 1461,
          height: 953,
          alt: "Left: a stack of botanical monoprints in many colours on a work table. Right: a magenta print showing the pale silhouettes of leaves and seed pods.",
        },
      },
      { kind: "heading", level: 3, text: "Wild Grasses and Delicate Flowers" },
      {
        kind: "paragraph",
        text: "Don't pass by the common weeds and wild grasses along the roadside. Plants like wheat ears, baby's breath (Gypsophila), bunny tails (Lagurus), speedwell (Veronica), lavender, and Green Trick Dianthus (green carnation) work wonders.",
      },
      {
        kind: "paragraph",
        text: "The long, fine lines of grass stems add a sense of movement, wind, and airiness to the composition. They work best as subtle details that will \"come alive\" on your artwork through the second layer, also known as the ghost print.",
      },
      { kind: "heading", level: 3, text: "Sunflower, Carnation, and Chrysanthemum" },
      {
        kind: "paragraph",
        text: "If you try to print a large chrysanthemum, a carnation, or a sunflower head in the standard way, you won't get a perfectly crisp graphic print. Because these flowers are bulky and have dozens of layers of petals, they cannot press completely flat against the paper.",
      },
      {
        kind: "image",
        image: {
          src: `${GEL_PLATE_DIR}/04-flower-heads.webp`,
          width: 1504,
          height: 911,
          alt: "Left: an open journal spread printed in teal with pressed ferns and flowers. Right: a purple monoprint arrangement of chrysanthemum heads and fern fronds.",
        },
      },
      {
        kind: "paragraph",
        text: "Instead of a clean silhouette, however, they leave behind stunning, rich textures and artistic imperfections that look incredibly striking in more abstract projects.",
      },
      {
        kind: "paragraph",
        text: "Don't forget that leaves and flowers can be used more than once! The key is to pick them up quickly after the first pull and gently wash off the paint without damaging them. This way, you will be able to make 2 to 3 consecutive prints from the same plant. With each subsequent print, the fine details will fade slightly, but you get wonderful pale backgrounds that are perfect as a base for the next layer.",
      },
      {
        kind: "paragraph",
        text: "You can also try printing with pressed, herbarium flowers, and the same rules for flatness apply to them. Use recently dried plants, as older ones are too fragile and will easily fall apart upon contact with the paint. Keep in mind that with dry flowers, the details of the veins cannot be fully transferred, so it's better to use them simply for their beautiful silhouette.",
      },
      {
        kind: "outbound",
        before:
          "If you prefer to see this exciting process firsthand, you can watch the step-by-step videos of how some of these paintings were created",
        linkLabel: "here",
        href: `https://uk.pinterest.com/${SITE.social.pinterest}/gelli-plate-printing-process/`,
        after: ".",
      },
    ],
  },
];

export const postBySlug = (slug: string): Post | undefined =>
  POSTS.find((p) => p.slug === slug);

/** Newest first — the order the index and any feeds should present posts in. */
export const POSTS_BY_DATE: Post[] = [...POSTS].sort((a, b) =>
  b.date.localeCompare(a.date),
);
