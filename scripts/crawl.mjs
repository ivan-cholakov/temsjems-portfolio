// One-off crawler for the live Framer site at moiraemoss.com.
// Visits each known route, waits for Framer to hydrate, captures structured
// text and images, downloads images into public/art/<slug>/, and writes
// content/crawl.json as the source of truth for the rebuild.

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { extname } from "node:path";
import { createHash } from "node:crypto";

const ROUTES = [
  { slug: "home",                path: "/" },
  { slug: "work",                path: "/work" },
  { slug: "thread-form",         path: "/work/thread-form" },
  { slug: "land-meets-the-sea",  path: "/work/land-meets-the-sea" },
  { slug: "stardust",            path: "/work/stardust" },
  { slug: "about",               path: "/work/about" },
  { slug: "contact",             path: "/work/contact" },
];

const ORIGIN = "https://moiraemoss.com";
const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT_DIR = `${ROOT}content`;
const ART_DIR     = `${ROOT}public/art`;

await mkdir(CONTENT_DIR, { recursive: true });
await mkdir(ART_DIR,     { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1800 },
  userAgent: "Mozilla/5.0 (compatible; moirae-rebuild-crawler/1.0)",
});

const downloaded = new Map(); // src -> public path
const allLinks = new Set();
const pages = [];

for (const route of ROUTES) {
  const url = ORIGIN + route.path;
  console.log(`\n→ ${url}`);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  // Framer often lazy-mounts below the fold; scroll the page to force render.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 250));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle").catch(() => {});

  const data = await page.evaluate(() => {
    const text = (n) => (n?.textContent || "").replace(/\s+/g, " ").trim();
    const visible = (el) => {
      const s = getComputedStyle(el);
      return s.visibility !== "hidden" && s.display !== "none" && el.offsetHeight > 0;
    };

    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"))
      .filter(visible)
      .map(h => ({ tag: h.tagName.toLowerCase(), text: text(h) }))
      .filter(h => h.text);

    const paragraphs = Array.from(document.querySelectorAll("p, li, blockquote"))
      .filter(visible)
      .map(text)
      .filter(t => t.length > 1);

    const images = Array.from(document.querySelectorAll("img"))
      .filter(visible)
      .map(img => ({
        src: img.currentSrc || img.src,
        alt: img.alt || "",
        width: img.naturalWidth,
        height: img.naturalHeight,
      }))
      .filter(i => i.src && !i.src.startsWith("data:"));

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map(a => a.href)
      .filter(h => h.startsWith("http"));

    const meta = {
      title: document.title,
      description:
        document.querySelector('meta[name="description"]')?.content || "",
      ogImage:
        document.querySelector('meta[property="og:image"]')?.content || "",
    };

    return { headings, paragraphs, images, links, meta };
  });

  for (const l of data.links) allLinks.add(l);

  // Download images for this page into public/art/<slug>/
  const slugDir = `${ART_DIR}/${route.slug}`;
  await mkdir(slugDir, { recursive: true });

  for (const img of data.images) {
    if (downloaded.has(img.src)) {
      img.local = downloaded.get(img.src);
      continue;
    }
    try {
      const resp = await fetch(img.src);
      if (!resp.ok) {
        console.warn(`  ! ${resp.status} ${img.src}`);
        continue;
      }
      // Build a stable filename from URL hash + best-effort extension.
      const hash = createHash("sha1").update(img.src).digest("hex").slice(0, 12);
      const urlPath = new URL(img.src).pathname;
      let ext = extname(urlPath).split("?")[0];
      if (!ext) {
        const ct = resp.headers.get("content-type") || "";
        if      (ct.includes("png"))  ext = ".png";
        else if (ct.includes("webp")) ext = ".webp";
        else if (ct.includes("jpeg") || ct.includes("jpg")) ext = ".jpg";
        else if (ct.includes("svg"))  ext = ".svg";
        else                          ext = ".bin";
      }
      const fname = `${hash}${ext}`;
      const local = `/art/${route.slug}/${fname}`;
      const fsPath = `${slugDir}/${fname}`;
      await pipeline(Readable.fromWeb(resp.body), createWriteStream(fsPath));
      downloaded.set(img.src, local);
      img.local = local;
      console.log(`  ↓ ${img.src.slice(0, 80)} → ${local}`);
    } catch (e) {
      console.warn(`  ! download failed ${img.src}: ${e.message}`);
    }
  }

  pages.push({ ...route, url, ...data });
  await page.close();
}

await browser.close();

await writeFile(
  `${CONTENT_DIR}/crawl.json`,
  JSON.stringify({ crawledAt: new Date().toISOString(), origin: ORIGIN, pages, externalLinks: [...allLinks] }, null, 2),
);

console.log(`\n✓ wrote ${CONTENT_DIR}/crawl.json`);
console.log(`✓ ${downloaded.size} unique images in ${ART_DIR}/`);
