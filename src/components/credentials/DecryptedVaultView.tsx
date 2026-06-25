"use client";

/**
 * Shared decrypted vault content renderer.
 * Used by both PreviewModal (creator) and unlock page (trusted contact).
 */
import { useMemo } from "react";
import { Wallet, TrendingUp, Palette, Gamepad2, Globe, Package } from "lucide-react";

interface VaultItem {
  id: string;
  vaultType?: string;
  aliasName?: string | null;
  memoryHint?: string | null;
  alias?: string; // unlock page uses "alias"
  type?: string;  // unlock page uses "type"
  content: string; // raw decrypted text
}

interface AssetEntry {
  platform: string;
  action: string;
  notes?: string;
  category: string;
  accountName?: string;
  invType?: string;
  scale?: string;
  audience?: string;
  income?: string;
  value?: string;
  bind?: string;
  business?: string;
  assets?: string;
}

// ── Category config ──
const CATEGORY_META: Record<string, { icon: typeof Wallet; color: string; bg: string; label: string }> = {
  finance:    { icon: Wallet,     color: "text-amber-600",     bg: "bg-amber-50",     label: "Finance" },
  investment: { icon: TrendingUp, color: "text-emerald-600",   bg: "bg-emerald-50",   label: "Investment" },
  creator:    { icon: Palette,    color: "text-purple-600",    bg: "bg-purple-50",    label: "Creator" },
  gaming:     { icon: Gamepad2,   color: "text-sky-600",       bg: "bg-sky-50",       label: "Gaming" },
  social:     { icon: Globe,      color: "text-blue-600",      bg: "bg-blue-50",      label: "Social" },
  payment:    { icon: Wallet,     color: "text-green-600",     bg: "bg-green-50",     label: "Payment" },
  entertainment: { icon: Gamepad2, color: "text-pink-600",     bg: "bg-pink-50",      label: "Entertainment" },
  creative:   { icon: Palette,    color: "text-indigo-600",    bg: "bg-indigo-50",    label: "Creative" },
  金融:   { icon: Wallet,     color: "text-amber-600",   bg: "bg-amber-50",   label: "Finance" },
  投资:   { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "Investment" },
  创作者: { icon: Palette,    color: "text-purple-600",  bg: "bg-purple-50",  label: "Creator" },
  游戏:   { icon: Gamepad2,   color: "text-sky-600",     bg: "bg-sky-50",     label: "Gaming" },
  other:  { icon: Package,    color: "text-slate-600",   bg: "bg-slate-50",   label: "Other" },
};

const ACTION_STYLE: Record<string, { label: string; badge: string }> = {
  withdraw:       { label: "Withdraw",            badge: "bg-red-50 text-red-700" },
  deposit:        { label: "Deposit",             badge: "bg-red-50 text-red-700" },
  cashOut:        { label: "Cash Out",            badge: "bg-orange-50 text-orange-700" },
  sell:           { label: "Sell",                badge: "bg-orange-50 text-orange-700" },
  hold:           { label: "Hold",                badge: "bg-blue-50 text-blue-700" },
  transfer:       { label: "Transfer",            badge: "bg-indigo-50 text-indigo-700" },
  keep:           { label: "Keep",                badge: "bg-green-50 text-green-700" },
  continue:       { label: "Maintain",            badge: "bg-green-50 text-green-700" },
  memorialize:    { label: "Memorialize",         badge: "bg-purple-50 text-purple-700" },
  delete:         { label: "Delete",              badge: "bg-neutral-100 text-neutral-600" },
  undecided:      { label: "Undecided",           badge: "bg-neutral-100 text-neutral-500" },
  "信使自行处置":  { label: "Trusted Contact Decides", badge: "bg-slate-100 text-slate-700" },
};

function resolveMeta(category?: string) {
  if (!category) return CATEGORY_META.other;
  if (CATEGORY_META[category]) return CATEGORY_META[category];
  const lower = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_META)) {
    if (k.toLowerCase() === lower) return v;
  }
  return CATEGORY_META.other;
}

function deepParse(raw: string): unknown {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return deepParse(parsed);
    return parsed;
  } catch {
    return raw;
  }
}

interface ParsedVault {
  id: string;
  name: string;
  hint?: string | null;
  vaultType: string;
  kind: "letter" | "asset" | "unknown";
  letter?: string;
  entries: AssetEntry[];
}

function parseVault(v: VaultItem): ParsedVault {
  const name = v.aliasName || v.alias || "Vault";
  const vaultType = v.vaultType || v.type || "unknown";
  const hint = v.memoryHint;

  const raw = v.content;
  if (!raw) return { id: v.id, name, hint, vaultType, kind: "unknown", entries: [] };

  if (vaultType === "farewell_letter") {
    const parsed = deepParse(raw);
    const letter = typeof parsed === "string" ? parsed
      : (typeof parsed === "object" && parsed !== null && "content" in parsed
        ? String((parsed as Record<string,unknown>).content)
        : JSON.stringify(parsed, null, 2));
    return { id: v.id, name, hint, vaultType, kind: "letter", letter, entries: [] };
  }

  // asset_inventory or wishlist
  const parsed = deepParse(raw);
  if (typeof parsed === "string") {
    return { id: v.id, name, hint, vaultType, kind: "letter", letter: parsed, entries: [] };
  }

  const obj = parsed as Record<string, unknown>;
  let entries: AssetEntry[] = [];
  if (Array.isArray(obj.entries)) entries = obj.entries as AssetEntry[];
  else if (Array.isArray(obj.assets)) entries = obj.assets as AssetEntry[];
  else if (Array.isArray(obj)) entries = obj as unknown as AssetEntry[];
  else entries = [obj as unknown as AssetEntry];

  return { id: v.id, name, hint, vaultType, kind: "asset", entries };
}

const vaultTypeIcon = (t: string) => t === "farewell_letter" ? "💌" : "📋";

interface Props {
  vaults: VaultItem[];
  /** Callback when a vault has zero entries matched — return fallback content */
  renderFallback?: (v: VaultItem) => React.ReactNode;
  className?: string;
}

export function DecryptedVaultView({ vaults, renderFallback, className = "" }: Props) {
  const parsed = useMemo(() => vaults.map(parseVault), [vaults]);
  const totalEntries = parsed.reduce((s, v) => s + v.entries.length, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {parsed.map((pv, vi) => (
        <div key={pv.id}>
          {/* Vault header */}
          <div className="flex items-center gap-2 mb-2.5 px-0.5">
            <span className="text-lg">{vaultTypeIcon(pv.vaultType)}</span>
            <span className="text-sm font-semibold text-neutral-700">{pv.name}</span>
            {pv.hint && <span className="text-[11px] text-neutral-400 truncate">· 💡 {pv.hint}</span>}
          </div>

          {/* Farewell letter */}
          {pv.kind === "letter" && (
            <div className="relative rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 via-white to-white p-5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 via-rose-200 to-transparent rounded-t-2xl" />
              <pre className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap font-serif">
                {pv.letter || "—"}
              </pre>
            </div>
          )}

          {/* Asset cards */}
          {pv.kind === "asset" && pv.entries.length > 0 && (
            <div className="space-y-2">
              {pv.entries.map((entry, ei) => {
                const meta = resolveMeta(entry.category);
                const action = ACTION_STYLE[entry.action] || { label: entry.action, badge: "bg-neutral-50 text-neutral-600" };
                const Icon = meta.icon;
                return (
                  <div
                    key={ei}
                    className="group flex items-start gap-3.5 px-4 py-3.5 rounded-xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all"
                  >
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-[18px] h-[18px] ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-neutral-800">{entry.platform}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${action.badge}`}>{action.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5">
                        {entry.accountName && <Detail label="Account" value={entry.accountName} />}
                        {entry.scale && <Detail label="Scale" value={entry.scale} />}
                        {entry.invType && <Detail label="Type" value={entry.invType} />}
                        {entry.value && <Detail label="Value" value={entry.value} />}
                        {entry.audience && <Detail label="Audience" value={entry.audience} />}
                        {entry.income && <Detail label="Income" value={entry.income} colSpan />}
                        {entry.bind && <Detail label="Bind" value={entry.bind} />}
                        {entry.notes && <p className="text-[12px] text-neutral-400 italic col-span-2 mt-0.5">{entry.notes}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback for unparseable / unknown */}
          {pv.kind === "unknown" && renderFallback?.(vaults[vi])}
        </div>
      ))}
    </div>
  );
}

function Detail({ label, value, colSpan }: { label: string; value: string; colSpan?: boolean }) {
  return (
    <p className={`text-[12px] text-neutral-500 ${colSpan ? "col-span-2" : ""}`}>
      <span className="text-neutral-400">{label}</span>{"  "}
      <span className="text-neutral-700 font-medium">{value}</span>
    </p>
  );
}
