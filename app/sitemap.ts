import type { MetadataRoute } from "next";
import { PROJECTS, SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/work`,    lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`,   lastModified, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${base}/blog`,    lastModified, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/contact`, lastModified, changeFrequency: "yearly",  priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
