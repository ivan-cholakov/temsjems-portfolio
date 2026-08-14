import type { MetadataRoute } from "next";
import { PROJECTS } from "@/content/site";
import { POSTS } from "@/content/blog";
import { pageUrl } from "@/lib/urls";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/"),        lastModified, changeFrequency: "monthly", priority: 1.0 },
    { url: pageUrl("/work"),    lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: pageUrl("/about"),   lastModified, changeFrequency: "yearly",  priority: 0.7 },
    { url: pageUrl("/blog"),    lastModified, changeFrequency: "weekly",  priority: 0.6 },
    { url: pageUrl("/contact"), lastModified, changeFrequency: "yearly",  priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: pageUrl(`/work/${p.slug}`),
    lastModified,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: pageUrl(`/blog/${p.slug}`),
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
