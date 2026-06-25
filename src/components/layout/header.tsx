"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, Shield, LogIn, UserCheck, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { BindModal } from "@/components/auth/BindModal";
import { getUserStatus } from "@/lib/vault-service";
import { useI18n } from "@/i18n";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [showBind, setShowBind] = useState(false);
  const [purpose, setPurpose] = useState<"bind" | "login">("login");
  const [isBound, setIsBound] = useState(false);
  const [maskedContact, setMaskedContact] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserStatus().then((s) => {
      setIsBound(s.hasPhone || s.hasEmail);
      setMaskedContact(s.maskedContact);
    }).catch(() => {});
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  function openAuth() {
    setPurpose(isBound ? "login" : "bind");
    setShowBind(true);
  }

  function handleChangeBind() {
    setPurpose("bind");
    setShowBind(true);
    setShowDropdown(false);
  }

  async function handleUnbind() {
    setShowDropdown(false);
    if (!confirm(t.bind.unbindConfirm)) return;
    try {
      const res = await fetch("/api/auth/unbind", { method: "POST" });
      if (res.ok) {
        setIsBound(false);
        setMaskedContact(null);
        toast.success(isZh ? "已解除绑定" : "Unlinked");
      } else {
        toast.error(t.common.error);
      }
    } catch {
      toast.error(t.common.error);
    }
  }

  const isZh = lang !== "en";

  function refreshStatus(s: any) {
    setIsBound(s.hasPhone || s.hasEmail);
    setMaskedContact(s.maskedContact);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
            <Heart className="w-5 h-5 text-warm-500 fill-warm-500" />
            <span className="text-foreground">{t.common.appName}</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/inventory" className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all">
              {t.inventory.navTitle}
            </Link>
            <Link href="/letters" className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all">
              {t.letters.title}
            </Link>
            <Link href="/settings" className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all">
              <Shield className="w-3.5 h-3.5" />
              {t.settings.navTitle}
            </Link>
            <div className="w-px h-4 bg-border mx-1" />
            <Link href="/blog" className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all">
              Blog
            </Link>
            <button
              onClick={() => setLang(lang === "zh" ? "en" : "zh")}
              className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2 text-[0.8rem] hover:bg-muted hover:text-foreground transition-all font-medium"
              title={lang === "zh" ? "Switch to English" : "切换到中文"}
              aria-label={lang === "zh" ? "Switch to English" : "切换到中文"}
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            {isBound ? (
              /* —— 已绑定：下拉菜单 —— */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] text-emerald-600 hover:bg-emerald-50 transition-all"
                  title={maskedContact || t.common.boundTooltip}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{maskedContact || t.common.bound}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E5DF] rounded-xl shadow-lg py-1 z-10 min-w-[200px]">
                    <div className="px-3 py-1.5 text-[11px] text-muted-foreground truncate">
                      {maskedContact}
                    </div>
                    <div className="border-t border-[#E8E5DF]/60 my-0.5" />
                    <button
                      onClick={handleChangeBind}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-muted-foreground" />
                      {t.bind.changeBind}
                    </button>
                    <button
                      onClick={handleUnbind}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      {t.bind.unbindTitle}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* —— 未绑定：登录/绑定入口 —— */
              <button
                onClick={openAuth}
                className="inline-flex items-center justify-center rounded-lg h-7 gap-1 px-2.5 text-[0.8rem] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t.common.login}
              </button>
            )}
          </nav>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-1">
            <Link href="/inventory" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-all text-xs">📋</Link>
            <Link href="/blog" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-all text-xs">📝</Link>
            <Link href="/letters" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-all text-xs">💌</Link>
            <Link href="/settings" className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-all text-xs">⚙️</Link>
            <button
              onClick={openAuth}
              className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-all text-xs"
            >
              {isBound ? "✅" : "👤"}
            </button>
          </div>
        </div>
      </header>

      <BindModal
        open={showBind}
        onClose={() => setShowBind(false)}
        purpose={purpose}
        onSuccess={() => {
          getUserStatus().then(refreshStatus).catch(() => {});
        }}
      />
    </>
  );
}
