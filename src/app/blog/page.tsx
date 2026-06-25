import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | In Case — Digital Safety Net Guides & Insights",
  description:
    "Honest guides on digital safety nets, encryption, and keeping your online life in order — no fluff, no hard sell.",
  openGraph: {
    title: "Blog | In Case — Digital Safety Net Guides & Insights",
    description:
      "Honest guides on digital safety nets, encryption, and keeping your online life in order.",
    type: "website",
    locale: "en_US",
    siteName: "In Case",
  },
};

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords?: string[];
  readingTime?: number;
}

function getAllPosts(): PostMeta[] {
  const dir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    const wordCount = raw.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    return {
      slug: file.replace(/\.mdx$/, ""),
      title: data.title ?? file,
      description: data.description ?? "",
      date: data.date ?? "",
      keywords: data.keywords ?? [],
      readingTime,
    };
  });

  // Newest first
  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return posts;
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      {/* Header */}
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        The In Case Blog
      </h1>
      <p className="text-[0.9rem] text-muted-foreground leading-relaxed mb-10">
        Honest guides about digital safety nets, encryption, and keeping your online life in order — just in case.
      </p>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group p-6 rounded-xl border border-border/60 hover:border-warm-300/70 hover:shadow-md hover:bg-warm-50/30 transition-all duration-200"
            >
              <h2 className="text-lg font-semibold text-neutral-800 group-hover:text-warm-700 transition-colors mb-1.5">
                {post.title}
              </h2>
              <p className="text-[0.85rem] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center gap-4 text-[0.75rem] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date
                    ? new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readingTime} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* RSS hint */}
      <p className="mt-12 text-[0.75rem] text-neutral-400 text-center">
        New posts every few weeks. No newsletter, no spam — just drop by when
        you feel like it.
      </p>
    </div>
  );
}
