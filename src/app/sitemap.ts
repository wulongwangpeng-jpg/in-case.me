import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://in-case.me";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // Auto-discover blog posts from the content directory
  const blogDir = path.join(process.cwd(), "src/content/blog");
  let blogPosts: MetadataRoute.Sitemap = [];

  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
    blogPosts = files.map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const stats = fs.statSync(path.join(blogDir, file));
      return {
        url: `${baseUrl}/blog/${slug}`,
        lastModified: stats.mtime,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
    });
  }

  return [...staticPages, ...blogPosts];
}
