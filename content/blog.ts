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
  | { kind: "outbound"; before: string; linkLabel: string; href: string; after: string }
  /** In-site link to another post — crawlable, same-tab, good for internal SEO. */
  | { kind: "crosslink"; before: string; slug: string; linkLabel: string; after: string };

export type Post = {
  slug: string;
  title: string;
  /** Standfirst / meta description — one sentence, no trailing period needed. */
  excerpt: string;
  /** Hide the excerpt as visible standfirst text (post header + listing card). Still used for SEO meta. */
  hideExcerpt?: boolean;
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
        case "crosslink":
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
const TEXTURES_DIR = "/blog/unexpected-textures-for-gel-plate-printing";

export const POSTS: Post[] = [
  {
    slug: "unexpected-textures-for-gel-plate-printing",
    title: "10 Unexpected Textures for Gel Plate Printing",
    excerpt:
      "Beyond leaves and flowers - ten everyday materials I reach for to bring depth, grunge and abstract character to a gel plate print, from vintage lace and corrugated cardboard to mesh fruit bags and crinkled rice paper.",
    hideExcerpt: true,
    date: "2026-07-14",
    author: SITE.artist,
    cover: {
      src: `${TEXTURES_DIR}/cover.webp`,
      width: 1100,
      height: 1350,
      alt: "Four gel plate monoprints in purple, teal, deep red and navy laid on a wooden table, framed by vintage lace, corrugated cardboard, mesh netting and a painted peacock feather.",
    },
    body: [
      {
        kind: "paragraph",
        text: "The gel plate is an incredible tool for capturing the hidden textures of the world around us. When it comes to building rich, grungy, and abstract layers, the best tools are rarely found in an art supply store. From the delicate threads of vintage lace to the harsh lines of corrugated cardboard and mesh fruit bags, ordinary materials can completely transform a piece. Today, I'm sharing 10 of my absolute favorite unconventional items to build striking depth, spontaneous patterns, and unique character in my gel prints.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/06-textures-overview.webp`,
          width: 1600,
          height: 1303,
          alt: "A flat-lay of four gel plate monoprints - purple with stripes and lace, navy with white flower bursts, teal with a raised damask pattern and deep red with a seed pod and lace - surrounded by vintage lace, medical gauze, corrugated cardboard, bubble wrap and a hand-painted peacock feather.",
        },
      },
      { kind: "heading", level: 2, text: "1. Lace and Textured Fabrics" },
      {
        kind: "paragraph",
        text: "This is easily one of my favorite and most frequently used materials in my creative practice. A piece of vintage lace can instantly transform a simple color background into a complex, romantic piece filled with rich ornamentation.",
      },
      { kind: "heading", level: 2, text: "2. Corrugated Cardboard" },
      {
        kind: "paragraph",
        text: "One of my absolute favorite techniques is using pieces of cardboard - specifically the exposed, ribbed inner layer of shipping boxes. You can use it like a stamp, pressing it vertically, horizontally, or even cross-hatching the lines to create a complex, geometric, and highly abstract effect.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/01-cardboard-lace-gauze.webp`,
          width: 1600,
          height: 1031,
          alt: "A purple gel print stacking three textures - bold cardboard stripes across the top, delicate floral lace through the middle and crumpled medical gauze below - beside inked plates carrying a swirling rose pattern.",
          caption: "Cardboard, lace, medical gauze",
        },
      },
      { kind: "heading", level: 2, text: "3. Bubble Wrap" },
      {
        kind: "paragraph",
        text: "I adore using bubble wrap in my work! It comes in various bubble sizes and is an incredibly versatile material that instantly breaks up flat areas of color, adding a perfect geometric contrast to more organic shapes.",
      },
      { kind: "heading", level: 2, text: "4. Medical Gauze" },
      {
        kind: "paragraph",
        text: "Gauze is an extremely adaptable and forgiving material. I highly recommend distorting it before placing it down - stretch it out, pull some holes into it, and let the loose threads fray. Embracing this chaotic, deconstructed look adds a wonderful grunge and abstract feel to the print.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/02-lace-gauze-bubble-wrap.webp`,
          width: 1600,
          height: 1071,
          alt: "A teal gel print combining lace, dotted bubble-wrap texture and a raised damask motif, next to a magenta print half-covered by a length of loose medical gauze.",
          caption: "Lace, medical gauze, bubble wrap",
        },
      },
      { kind: "heading", level: 2, text: "5. Mesh Fruit Bags" },
      {
        kind: "paragraph",
        text: "Don't throw away the mesh bags from lemons or garlic! They are fantastic for creating a honeycomb or grid-like effect on the gel plate. They stretch easily and make an amazing, subtle background texture.",
      },
      { kind: "heading", level: 2, text: "6. Crinkled Rice Paper" },
      {
        kind: "paragraph",
        text: "While any type of paper can yield interesting results, crinkled rice paper is pure magic. When you fold, crumple, and press it onto the plate, it creates beautiful, organic creases that mimic cracked earth or delicate marble veins.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/03-rice-paper.webp`,
          width: 1600,
          height: 838,
          alt: "Warm rust and orange gel prints capturing the crinkled, marble-like veining of pressed rice paper, shown with lace netting, crumpled paper scraps, a gel plate and a linocut portrait over the same crackled ground.",
          caption: "Rice paper",
        },
      },
      { kind: "heading", level: 2, text: "7. Feathers and Pampas Grass" },
      {
        kind: "paragraph",
        text: "Unlike hard objects, feathers and fluffy pampas grass are incredibly light and ethereal. They don't leave sharp, harsh lines, but rather soft, ghostly silhouettes that introduce a beautiful tenderness to the composition.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/04-feathers-linocut.webp`,
          width: 1600,
          height: 1074,
          alt: "Two teal gel plates arranged with real feathers - one with dark feathers laid around pale carved linocut shapes, the other a soft ghost print left after the feathers lifted away.",
          caption: "Feathers and linocut",
        },
      },
      { kind: "heading", level: 2, text: "8. Embroidery Floss and Twine" },
      {
        kind: "paragraph",
        text: "Much like gauze, threads are a wonderful tool. You can use thicker embroidery floss or coarse twine, and they can be utilized in two brilliant ways.",
      },
      {
        kind: "paragraph",
        text: "For texture, press them into the wet paint to leave behind their fine, subtle tracks.",
      },
      {
        kind: "paragraph",
        text: "As a mask for negative space, arrange them on the plate, lay your paper down, and pull the print. When you lift the threads, they leave clean silhouettes perfectly prepared for your next layer.",
      },
      { kind: "heading", level: 2, text: "9. Textured Paper" },
      {
        kind: "paragraph",
        text: "The more textured the paper, the better it transfers its unique structure. The secret here is to use a minimal amount of paint on the gel plate. If your layer is too thick, the paint will flood the grooves of the paper, and you will lose those fine, subtle details.",
      },
      { kind: "heading", level: 2, text: "10. Flowers and Plants" },
      {
        kind: "paragraph",
        text: "Of course, despite all these wonderful alternative materials, I will never stop talking about my love for real flowers and leaves on the gel plate. Botanical prints hold a very special place in my creative process. The delicate veins of a leaf or the intricate silhouette of a petal offer a timeless, organic contrast that beautifully complements the abstract, everyday textures mentioned above.",
      },
      {
        kind: "image",
        image: {
          src: `${TEXTURES_DIR}/05-botanical-prints.webp`,
          width: 1600,
          height: 1102,
          alt: "An open art journal spread printed in teal and green - one page holding a ghostly female figure, the other soft fern prints - laid on a black cloth among fresh flowers, a sunflower, dried grasses, a stencil and tubes of acrylic paint.",
        },
      },
      {
        kind: "crosslink",
        before:
          "If you want to dive deeper into botanical printing and see how I use nature to create my favorite pieces, check out my dedicated post",
        slug: "best-plants-for-gel-plate-printing",
        linkLabel: "here",
        after: ".",
      },
    ],
  },
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
