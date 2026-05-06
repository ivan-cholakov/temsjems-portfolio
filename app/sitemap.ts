import type { MetadataRoute } from "next";
import { PROJECTS, SITE } from "@/content/site";

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

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${SITE.url}/work/${p.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
