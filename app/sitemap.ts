import type { MetadataRoute } from "next";
import { PROJECTS, SERIES, SITE, seriesPath } from "@/content/site";
import { POSTS } from "@/content/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`,        lastModified, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE.url}/work`,    lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/about`,   lastModified, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${SITE.url}/blog`,    lastModified, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE.url}/contact`, lastModified, changeFrequency: "yearly",  priority: 0.5 },
  ];

  const seriesRoutes: MetadataRoute.Sitemap = SERIES.map((s) => ({
    url: `${SITE.url}${seriesPath(s.slug)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE.url}/work/${p.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...seriesRoutes, ...projectRoutes, ...postRoutes];
}
