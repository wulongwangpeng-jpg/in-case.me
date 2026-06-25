"use client";

import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose prose-sm prose-neutral">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Globe className="w-6 h-6 text-warm-500" />
        About In Case
      </h1>

      <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">What We Do</h2>
          <p>
            In Case (万一呢) is a digital asset planning platform. We help you map out your
            digital footprint — social accounts, financial platforms, creative work, gaming
            libraries — and leave clear instructions for the people you trust. Everything you
            create is encrypted in your browser before it reaches our servers. We use
            zero-knowledge architecture: you hold the only key.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">Who We Are</h2>
          <p>
            In Case is independently built and operated by a full-stack engineer based in China.
            There is no team, no venture funding, and no corporate parent — just one person
            committed to building something useful and private.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">Our Principles</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Zero-knowledge by design.</strong> We cannot read your data. Period.</li>
            <li><strong>Open source & auditable.</strong> Our entire codebase is on GitHub. Trust is built on transparency.</li>
            <li><strong>No tracking, no ads, no data selling.</strong> We are funded by subscriptions, not surveillance.</li>
            <li><strong>Your data is yours.</strong> Export or delete everything at any time, no lock-in.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Email: <a href="mailto:support@in-case.me" className="text-warm-600 hover:underline">support@in-case.me</a>
          </p>
          <p className="mt-1">
            GitHub: <a href="https://github.com/wulongwangpeng-jpg/in-case.me" target="_blank" rel="noopener noreferrer" className="text-warm-600 hover:underline">github.com/wulongwangpeng-jpg/in-case.me</a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">Business Information</h2>
          <p>
            Operated by: Lingbao Infinite Domain Network Technology Studio (灵宝市无限领域网络科技工作室)
            <br />
            Unified Social Credit Code: 92411282MAKGKCRJ71
            <br />
            Address: No. 66, Guxian Street, Guxian Town, Lingbao City, Henan Province, China
          </p>
        </div>
      </section>
    </div>
  );
}
