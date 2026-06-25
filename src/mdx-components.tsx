import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1
        className="text-3xl font-bold tracking-tight text-neutral-900 mt-12 mb-4 first:mt-0"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="text-xl font-semibold text-neutral-800 mt-10 mb-3 pb-1.5 border-b border-neutral-200/70"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="text-lg font-medium text-neutral-700 mt-8 mb-2"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p
        className="text-[0.925rem] leading-relaxed text-neutral-700 my-4"
        {...props}
      >
        {children}
      </p>
    ),
    a: ({ children, href, ...props }) => (
      <Link
        href={href ?? "#"}
        className="text-warm-600 underline underline-offset-2 decoration-warm-300 hover:decoration-warm-500 transition-colors"
        {...props}
      >
        {children}
      </Link>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 my-4 space-y-1.5 text-[0.925rem] text-neutral-700" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 my-4 space-y-1.5 text-[0.925rem] text-neutral-700" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-neutral-800" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-neutral-600" {...props}>
        {children}
      </em>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-3 border-warm-300 pl-4 my-6 text-neutral-600 italic bg-warm-50/50 py-3 pr-4 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table
          className="w-full text-[0.875rem] border-collapse border border-neutral-200 rounded-lg overflow-hidden"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-neutral-50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => (
      <tr className="border-b border-neutral-100/70 last:border-b-0" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th
        className="text-left px-4 py-2.5 font-medium text-neutral-700 border-b border-neutral-200 text-[0.8rem] uppercase tracking-wider"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="px-4 py-2.5 text-neutral-600"
        {...props}
      >
        {children}
      </td>
    ),
    hr: (props) => (
      <hr className="my-10 border-neutral-200/70" {...props} />
    ),
    code: ({ children, ...props }) => (
      <code
        className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded text-[0.85em] font-mono"
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre
        className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto my-6 text-[0.85rem] leading-relaxed"
        {...props}
      >
        {children}
      </pre>
    ),
  };
}
