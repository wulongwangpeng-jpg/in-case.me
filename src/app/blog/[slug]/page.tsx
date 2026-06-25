import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ slug: f.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return getPostMeta(slug);
}

function getPostMeta(slug: string): Metadata {
  const dir = path.join(process.cwd(), "src/content/blog");
  const filePath = path.join(dir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return { title: "Post Not Found" };
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  return {
    title: `${data.title ?? slug} | In Case Blog`,
    description: data.description ?? "",
    keywords: data.keywords ?? [],
    openGraph: {
      title: `${data.title ?? slug} | In Case Blog`,
      description: data.description ?? "",
      type: "article",
      publishedTime: data.date ?? "",
      locale: "en_US",
      siteName: "In Case",
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const dir = path.join(process.cwd(), "src/content/blog");
  const filePath = path.join(dir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">
          Post not found
        </h1>
        <Link
          href="/blog"
          className="text-warm-600 hover:text-warm-700 transition-colors text-sm"
        >
          ← Back to blog
        </Link>
      </div>
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const wordCount = raw.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Dynamic import of the MDX file for rendering
  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> All posts
      </Link>

      {/* Article header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3 leading-tight">
          {data.title}
        </h1>
        {data.description && (
          <p className="text-[0.95rem] text-muted-foreground leading-relaxed mb-4">
            {data.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-[0.75rem] text-neutral-400">
          {data.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(data.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readingTime} min read
          </span>
        </div>
      </header>

      {/* Article body */}
      <div className="prose-content">
        <Post />
      </div>

      {/* CTA footer */}
      <div className="mt-16 p-6 rounded-xl bg-gradient-to-br from-warm-50 to-cream-100 border border-warm-200/60 text-center">
        <p className="text-[0.9rem] text-neutral-600 leading-relaxed mb-3">
          In Case is an encrypted vault for your digital life — so your family
          never has to guess your passwords.{" "}
          <strong className="text-neutral-800">
            We can&apos;t read your data, and neither can anyone else
          </strong>{" "}
          unless you stop checking in.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-warm-600 font-medium hover:text-warm-700 transition-colors"
        >
          Learn how it works →
        </Link>
      </div>
    </article>
  );
}
