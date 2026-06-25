import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ClientLayout } from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "In Case | Your Digital Safety Net, Warmly",
  description:
    "Map your digital life, write letters that matter, and leave a spare key with the people you trust — just in case.",
  keywords: [
    "digital safety net",
    "digital estate planning",
    "zero-knowledge encryption",
    "password manager",
    "end-of-life planning",
    "digital asset inventory",
    "encrypted storage",
    "in case",
  ],
  authors: [{ name: "In Case", url: "https://in-case.me" }],
  creator: "In Case",
  publisher: "In Case",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "In Case | Your Digital Safety Net, Warmly",
    description:
      "Map your digital life, write letters that matter, and leave a spare key with the people you trust — just in case.",
    type: "website",
    locale: "en_US",
    siteName: "In Case",
  },
  twitter: {
    card: "summary_large_image",
    title: "In Case | Your Digital Safety Net, Warmly",
    description:
      "Map your digital life, write letters that matter. Encrypted storage, zero-knowledge architecture.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col gradient-hero">
        <ClientLayout>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-center" richColors />
        </ClientLayout>
      </body>
    </html>
  );
}
