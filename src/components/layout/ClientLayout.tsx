"use client";

import { I18nProvider } from "@/i18n";
import { CookieBanner } from "@/components/legal/CookieBanner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <CookieBanner />
    </I18nProvider>
  );
}
